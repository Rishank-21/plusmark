-- =====================================================================
-- Part 4: email queue, payments, order status, self-ship, returns, refunds
-- =====================================================================

-- ---------------------------------------------------------------- email queue
create or replace function public._order_email_payload(p_order uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'order', to_jsonb(o),
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.order_items i where i.order_id = o.id), '[]'::jsonb),
    'shipments', coalesce((select jsonb_agg(to_jsonb(sh) order by sh.created_at) from public.shipments sh where sh.order_id = o.id), '[]'::jsonb),
    'seller', (select jsonb_build_object('name', seller_name, 'gstin', seller_gstin, 'address', seller_address,
                 'phone', seller_phone, 'email', seller_email) from public.store_settings)
  ) from public.orders o where o.id = p_order;
$$;

create or replace function public._email_subject(p_template text, p_number text)
returns text language sql immutable as $$
  select case p_template
    when 'order_confirmation' then 'Order ' || p_number || ' confirmed'
    when 'payment_failed'     then 'Payment failed for order ' || p_number
    when 'order_processing'   then 'We are packing order ' || p_number
    when 'order_shipped'      then 'Order ' || p_number || ' is on its way'
    when 'order_delivered'    then 'Order ' || p_number || ' was delivered'
    when 'order_cancelled'    then 'Order ' || p_number || ' was cancelled'
    when 'return_requested'   then 'Return request received for order ' || p_number
    when 'return_approved'    then 'Return approved for order ' || p_number
    when 'return_rejected'    then 'Update on your return for order ' || p_number
    when 'return_received'    then 'We received your return for order ' || p_number
    when 'refund_processed'   then 'Refund processed for order ' || p_number
    when 'admin_new_order'    then 'New order ' || p_number
    when 'admin_attention'    then 'Needs attention: order ' || p_number
    else 'Update on order ' || p_number end
$$;

create or replace function public._queue_order_email(
  p_order uuid, p_template text, p_extra jsonb default '{}'::jsonb, p_dedupe text default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order;
  if not found then return; end if;
  insert into public.email_outbox (to_email, template, subject, payload, order_id, dedupe_key)
  values (o.email, p_template, public._email_subject(p_template, o.order_number),
          public._order_email_payload(p_order) || jsonb_build_object('extra', p_extra),
          p_order, coalesce(p_dedupe, p_order || ':' || p_template))
  on conflict (dedupe_key) do nothing;
end $$;
revoke all on function public._queue_order_email(uuid, text, jsonb, text) from public, anon, authenticated;

create or replace function public._queue_admin_email(
  p_order uuid, p_template text, p_extra jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders; v_to text;
begin
  select seller_email into v_to from public.store_settings;
  select * into o from public.orders where id = p_order;
  if v_to is null or not found then return; end if;
  insert into public.email_outbox (to_email, template, subject, payload, order_id, dedupe_key)
  values (v_to, p_template, public._email_subject(p_template, o.order_number),
          public._order_email_payload(p_order) || jsonb_build_object('extra', p_extra),
          p_order, p_order || ':' || p_template || ':' || md5(p_extra::text))
  on conflict (dedupe_key) do nothing;
end $$;
revoke all on function public._queue_admin_email(uuid, text, jsonb) from public, anon, authenticated;

-- Wake the email edge function whenever mail is queued (needs pg_net + app_config rows).
create or replace function public._kick_email_worker()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_url text; v_secret text;
begin
  select value into v_url from public.app_config where key = 'edge_base_url';
  select value into v_secret from public.app_config where key = 'job_secret';
  if v_url is not null and v_secret is not null and to_regnamespace('net') is not null then
    perform net.http_post(
      url := v_url || '/process-emails',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-job-secret', v_secret),
      body := '{}'::jsonb);
  end if;
  return null;
exception when others then
  return null;                                                  -- never block an order on email
end $$;
create trigger email_outbox_kick after insert on public.email_outbox
  for each statement execute function public._kick_email_worker();

-- ---------------------------------------------------------------- invoices
create or replace function public._assign_invoice(p_order uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_prefix text; v_fy text; v_now timestamp := now() at time zone 'Asia/Kolkata';
begin
  select invoice_prefix into v_prefix from public.store_settings;
  v_fy := case when extract(month from v_now) >= 4
    then to_char(v_now, 'YY') || to_char(v_now + interval '1 year', 'YY')
    else to_char(v_now - interval '1 year', 'YY') || to_char(v_now, 'YY') end;
  update public.orders
     set invoice_number = v_prefix || v_fy || '/' || lpad(nextval('public.invoice_number_seq')::text, 5, '0')
   where id = p_order and invoice_number is null;
end $$;
revoke all on function public._assign_invoice(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------- payments (service role only)
create or replace function public.register_payment_attempt(
  p_order_id uuid, p_provider_order_id text, p_amount_inr numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.payments (order_id, provider_order_id, amount_inr, status)
  values (p_order_id, p_provider_order_id, p_amount_inr, 'created') returning id into v_id;
  update public.orders set payment_status = 'pending'
   where id = p_order_id and payment_status in ('unpaid','failed','pending');
  return v_id;
end $$;

create or replace function public.confirm_payment(
  p_order_id uuid, p_provider_order_id text, p_provider_payment_id text,
  p_amount_paise bigint, p_method text, p_signature_verified boolean, p_raw jsonb default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.orders; v_pay public.payments; v_reserved boolean := true;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'order_not_found'); end if;

  select * into v_pay from public.payments
   where provider = 'razorpay' and provider_payment_id = p_provider_payment_id;
  if found and v_pay.status in ('captured','refunded','partially_refunded') then
    return jsonb_build_object('ok', true, 'already', true, 'order_number', o.order_number);
  end if;

  if p_amount_paise <> round(o.total_inr * 100) then
    insert into public.payments (order_id, provider_order_id, provider_payment_id, amount_inr, status, method, raw, error_description)
    values (o.id, p_provider_order_id, p_provider_payment_id, p_amount_paise / 100.0, 'captured', p_method, p_raw, 'amount mismatch')
    on conflict (provider, provider_payment_id) where provider_payment_id is not null do nothing;
    update public.orders set needs_attention = 'Payment amount mismatch: paid ' || (p_amount_paise / 100.0)
      || ' expected ' || o.total_inr where id = o.id;
    perform public._queue_admin_email(o.id, 'admin_attention', jsonb_build_object('reason', 'amount mismatch'));
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch');
  end if;

  update public.payments
     set provider_payment_id = p_provider_payment_id, status = 'captured', method = p_method,
         signature_verified = p_signature_verified, raw = coalesce(p_raw, raw)
   where id = (select id from public.payments
                where order_id = o.id and provider_order_id = p_provider_order_id
                  and provider_payment_id is null
                order by created_at desc limit 1)
  returning * into v_pay;
  if not found then
    insert into public.payments (order_id, provider_order_id, provider_payment_id, amount_inr, status, method, signature_verified, raw)
    values (o.id, p_provider_order_id, p_provider_payment_id, o.total_inr, 'captured', p_method, p_signature_verified, p_raw)
    on conflict (provider, provider_payment_id) where provider_payment_id is not null
      do update set status = 'captured', method = excluded.method
    returning * into v_pay;
  end if;

  if o.status = 'cancelled' then
    v_reserved := public._order_reserve_stock(o.id);
    if not v_reserved then
      update public.orders set payment_status = 'paid', paid_at = now(),
             needs_attention = 'Paid after the order expired and stock is gone: refund the customer'
       where id = o.id;
      perform public._order_event(o.id, 'cancelled', 'Payment received after cancellation', 'Refund required', false);
      perform public._queue_admin_email(o.id, 'admin_attention', jsonb_build_object('reason', 'paid after cancellation, no stock'));
      return jsonb_build_object('ok', true, 'needs_refund', true, 'order_number', o.order_number);
    end if;
  end if;

  update public.orders
     set payment_status = 'paid', paid_at = now(), cancelled_at = null,
         status = case when status in ('placed','payment_pending','payment_failed','cancelled') then 'confirmed' else status end,
         needs_attention = null
   where id = o.id;
  perform public._assign_invoice(o.id);
  perform public._order_event(o.id, 'confirmed', 'Payment received', 'Razorpay payment ' || p_provider_payment_id);
  perform public._queue_order_email(o.id, 'order_confirmation');
  perform public._queue_admin_email(o.id, 'admin_new_order');
  return jsonb_build_object('ok', true, 'order_number', o.order_number);
end $$;

create or replace function public.record_payment_failure(
  p_order_id uuid, p_provider_order_id text, p_provider_payment_id text,
  p_error_code text, p_error_description text, p_raw jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then return; end if;
  if p_provider_payment_id is not null then
    insert into public.payments (order_id, provider_order_id, provider_payment_id, amount_inr, status, error_code, error_description, raw)
    values (o.id, p_provider_order_id, p_provider_payment_id, o.total_inr, 'failed', p_error_code, left(p_error_description, 500), p_raw)
    on conflict (provider, provider_payment_id) where provider_payment_id is not null do nothing;
  end if;
  if o.payment_status <> 'paid' and o.status = 'payment_pending' then
    update public.orders set status = 'payment_failed', payment_status = 'failed' where id = o.id;
    perform public._order_event(o.id, 'payment_failed', 'Payment failed', left(p_error_description, 300));
    perform public._queue_order_email(o.id, 'payment_failed', '{}'::jsonb,
      o.id || ':payment_failed:' || coalesce(p_provider_payment_id, 'x'));
  end if;
end $$;

revoke all on function public.register_payment_attempt(uuid, text, numeric) from public, anon, authenticated;
revoke all on function public.confirm_payment(uuid, text, text, bigint, text, boolean, jsonb) from public, anon, authenticated;
revoke all on function public.record_payment_failure(uuid, text, text, text, text, jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------- refunds
create or replace function public.complete_refund(
  p_refund_id uuid, p_provider_refund_id text, p_ok boolean, p_error text default null)
returns void language plpgsql security definer set search_path = public as $$
declare rf public.refunds; o public.orders; v_paid numeric;
begin
  select * into rf from public.refunds where id = p_refund_id for update;
  if not found or rf.status = 'processed' then return; end if;
  if not p_ok then
    update public.refunds set status = 'failed', error = left(p_error, 500) where id = rf.id;
    return;
  end if;
  update public.refunds set status = 'processed', provider_refund_id = p_provider_refund_id,
         processed_at = now(), error = null where id = rf.id;
  select * into o from public.orders where id = rf.order_id for update;
  select coalesce(sum(amount_inr), 0) into v_paid from public.payments
   where order_id = o.id and status in ('captured','partially_refunded','refunded');
  update public.orders
     set refunded_inr = refunded_inr + rf.amount_inr,
         payment_status = case when refunded_inr + rf.amount_inr >= total_inr then 'refunded' else 'partially_refunded' end,
         status = case
           when status = 'refund_processing' and refunded_inr + rf.amount_inr >= total_inr then 'refunded'
           when status = 'refund_processing' then 'delivered'
           else status end,
         needs_attention = null
   where id = o.id;
  update public.payments set status = case when o.refunded_inr + rf.amount_inr >= o.total_inr then 'refunded' else 'partially_refunded' end
   where id = coalesce(rf.payment_id, (select id from public.payments where order_id = o.id and status in ('captured','partially_refunded') limit 1));
  if rf.return_id is not null then
    update public.returns set status = 'refunded', refund_inr = rf.amount_inr where id = rf.return_id;
  end if;
  insert into public.order_events (order_id, status, title, note)
  values (o.id, null, 'Refund of Rs ' || rf.amount_inr || ' processed', rf.reason);
  perform public._queue_order_email(o.id, 'refund_processed',
    jsonb_build_object('amount', rf.amount_inr, 'reason', rf.reason), o.id || ':refund:' || rf.id);
end $$;
revoke all on function public.complete_refund(uuid, text, boolean, text) from public, anon, authenticated;

create or replace function public.admin_create_refund(
  p_order_id uuid, p_amount_inr numeric, p_reason text, p_return_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare o public.orders; v_pay public.payments; v_pending numeric; v_id uuid;
begin
  perform public.require_admin();
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;
  if o.payment_status not in ('paid','partially_refunded') then
    raise exception 'order has no captured payment to refund';
  end if;
  select coalesce(sum(amount_inr), 0) into v_pending from public.refunds
   where order_id = o.id and status = 'pending';
  if p_amount_inr is null or p_amount_inr <= 0 or p_amount_inr > o.total_inr - o.refunded_inr - v_pending then
    raise exception 'invalid refund amount (max %)', o.total_inr - o.refunded_inr - v_pending;
  end if;
  select * into v_pay from public.payments
   where order_id = o.id and status in ('captured','partially_refunded') order by created_at limit 1;
  insert into public.refunds (order_id, payment_id, return_id, amount_inr, reason, created_by)
  values (o.id, v_pay.id, p_return_id, p_amount_inr, p_reason, auth.uid()) returning id into v_id;
  return v_id;
end $$;

-- COD / bank-transfer refunds, or a Razorpay refund done in their dashboard.
create or replace function public.admin_mark_refund_done(p_refund_id uuid, p_reference text default 'manual')
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  perform public.complete_refund(p_refund_id, coalesce(nullif(p_reference, ''), 'manual') || '-' || left(p_refund_id::text, 8), true);
end $$;

-- COD cash collected or bank transfer received.
create or replace function public.admin_record_payment(
  p_order_id uuid, p_amount_inr numeric, p_method text, p_reference text default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  perform public.require_admin();
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;
  if o.payment_status = 'paid' then raise exception 'order is already paid'; end if;
  insert into public.payments (order_id, provider, provider_payment_id, amount_inr, status, method, signature_verified)
  values (o.id, 'manual', 'manual-' || gen_random_uuid(), p_amount_inr, 'captured', coalesce(p_method, 'cod'), false);
  update public.orders set payment_status = 'paid', paid_at = now(),
         status = case when status in ('placed','payment_pending','payment_failed') then 'confirmed' else status end
   where id = o.id;
  perform public._assign_invoice(o.id);
  perform public._order_event(o.id, null, 'Payment recorded', coalesce(p_method, 'cod') || ' ' || coalesce(p_reference, ''), false);
end $$;

-- ---------------------------------------------------------------- order status
create or replace function public._set_order_status(p_order uuid, p_status text, p_note text, p_notify boolean)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders; v_ok boolean; v_amt numeric;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'order not found'; end if;
  if o.status = p_status then return; end if;
  v_ok := case o.status
    when 'placed' then p_status in ('confirmed','cancelled')
    when 'payment_pending' then p_status in ('cancelled')
    when 'payment_failed' then p_status in ('cancelled')
    when 'confirmed' then p_status in ('processing','dispatched','cancelled')
    when 'processing' then p_status in ('dispatched','cancelled')
    when 'dispatched' then p_status in ('delivered')
    when 'delivered' then p_status in ('return_requested')
    when 'return_requested' then p_status in ('delivered','refund_processing')
    when 'refund_processing' then p_status in ('refunded','delivered')
    else false end;
  if not v_ok then
    raise exception 'cannot move order from % to %', o.status, p_status;
  end if;
  if p_status = 'dispatched' and not exists (select 1 from public.shipments where order_id = o.id) then
    raise exception 'add a shipment with tracking before marking the order dispatched';
  end if;

  update public.orders set status = p_status,
      dispatched_at = case when p_status = 'dispatched' then coalesce(dispatched_at, now()) else dispatched_at end,
      delivered_at = case when p_status = 'delivered' then coalesce(delivered_at, now()) else delivered_at end,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
   where id = o.id;

  if p_status = 'cancelled' then
    perform public._order_release_stock(o.id, 'sale_cancelled');
    if o.payment_status in ('paid','partially_refunded') and o.total_inr - o.refunded_inr > 0
       and not exists (select 1 from public.refunds where order_id = o.id and status in ('pending','processed')) then
      v_amt := o.total_inr - o.refunded_inr;
      insert into public.refunds (order_id, payment_id, amount_inr, reason, created_by)
      values (o.id, (select id from public.payments where order_id = o.id and status in ('captured','partially_refunded') order by created_at limit 1),
              v_amt, 'Order cancelled', auth.uid());
      update public.orders set needs_attention = 'Refund of Rs ' || v_amt || ' pending' where id = o.id;
    end if;
  elsif p_status = 'dispatched' then
    perform public._assign_invoice(o.id);
  elsif p_status = 'delivered' and o.payment_method = 'cod' and o.payment_status <> 'paid' then
    insert into public.payments (order_id, provider, provider_payment_id, amount_inr, status, method)
    values (o.id, 'manual', 'cod-' || gen_random_uuid(), o.total_inr, 'captured', 'cod');
    update public.orders set payment_status = 'paid', paid_at = now() where id = o.id;
  end if;

  perform public._order_event(o.id, p_status,
    case p_status
      when 'confirmed' then 'Order confirmed' when 'processing' then 'Order is being packed'
      when 'dispatched' then 'Order dispatched' when 'delivered' then 'Order delivered'
      when 'cancelled' then 'Order cancelled' when 'return_requested' then 'Return requested'
      when 'refund_processing' then 'Refund in progress' when 'refunded' then 'Order refunded'
      else p_status end, p_note);

  if p_notify then
    if p_status = 'processing' then perform public._queue_order_email(o.id, 'order_processing');
    elsif p_status = 'delivered' then perform public._queue_order_email(o.id, 'order_delivered');
    elsif p_status = 'cancelled' then perform public._queue_order_email(o.id, 'order_cancelled', jsonb_build_object('note', p_note));
    end if;
  end if;
end $$;
revoke all on function public._set_order_status(uuid, text, text, boolean) from public, anon, authenticated;

create or replace function public.admin_update_order_status(
  p_order_id uuid, p_status text, p_note text default null, p_notify boolean default true)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  perform public._set_order_status(p_order_id, p_status, p_note, p_notify);
end $$;

create or replace function public.admin_set_order_notes(p_order_id uuid, p_admin_notes text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  update public.orders set admin_notes = p_admin_notes where id = p_order_id;
end $$;

create or replace function public.admin_resolve_attention(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  update public.orders set needs_attention = null where id = p_order_id;
end $$;

-- ---------------------------------------------------------------- self-ship tracking
create or replace function public.admin_set_shipment(
  p_order_id uuid, p_carrier_id text, p_carrier_name text, p_tracking_number text,
  p_tracking_url text, p_status text default 'dispatched',
  p_eta_from date default null, p_eta_to date default null, p_note text default null,
  p_shipment_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare o public.orders; v_id uuid; v_tpl text; v_cname text; v_url text; sh public.shipments;
begin
  perform public.require_admin();
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;
  if o.status not in ('confirmed','processing','dispatched') then
    raise exception 'cannot ship an order in status %', o.status;
  end if;
  if p_status not in ('pending','dispatched','in_transit','out_for_delivery','delivered','failed','returned') then
    raise exception 'bad shipment status';
  end if;
  if p_status <> 'pending' and coalesce(trim(p_tracking_number), '') = '' and coalesce(trim(p_tracking_url), '') = '' then
    raise exception 'tracking number or link is required';
  end if;

  select name, tracking_url_template into v_cname, v_tpl from public.carriers where id = p_carrier_id;
  v_cname := coalesce(nullif(trim(p_carrier_name), ''), v_cname);
  v_url := coalesce(nullif(trim(p_tracking_url), ''),
                    case when v_tpl is not null and coalesce(trim(p_tracking_number), '') <> ''
                         then replace(v_tpl, '{tracking}', trim(p_tracking_number)) end);
  if v_url is not null and v_url !~* '^https?://' then raise exception 'tracking link must start with http(s)://'; end if;

  if p_shipment_id is null then
    insert into public.shipments (order_id, carrier_id, carrier_name, tracking_number, tracking_url, status,
                                  shipped_at, eta_from, eta_to, note)
    values (o.id, p_carrier_id, v_cname, nullif(trim(p_tracking_number), ''), v_url, p_status,
            case when p_status <> 'pending' then now() end, p_eta_from, p_eta_to, p_note)
    returning id into v_id;
  else
    update public.shipments set carrier_id = p_carrier_id, carrier_name = v_cname,
           tracking_number = nullif(trim(p_tracking_number), ''), tracking_url = v_url, status = p_status,
           shipped_at = coalesce(shipped_at, case when p_status <> 'pending' then now() end),
           delivered_at = case when p_status = 'delivered' then coalesce(delivered_at, now()) else delivered_at end,
           eta_from = p_eta_from, eta_to = p_eta_to, note = p_note
     where id = p_shipment_id and order_id = o.id returning id into v_id;
    if v_id is null then raise exception 'shipment not found'; end if;
  end if;
  select * into sh from public.shipments where id = v_id;

  perform public._order_event(o.id, null,
    'Shipment ' || replace(p_status, '_', ' '),
    trim(coalesce(v_cname, '') || ' ' || coalesce(sh.tracking_number, '') || ' ' || coalesce(p_note, '')));

  if p_status in ('dispatched','in_transit','out_for_delivery') then
    if o.status in ('confirmed','processing') then
      perform public._set_order_status(o.id, 'dispatched', null, false);
    end if;
    perform public._queue_order_email(o.id, 'order_shipped',
      jsonb_build_object('shipment', to_jsonb(sh)), o.id || ':shipped:' || v_id || ':' || coalesce(sh.tracking_number, ''));
  elsif p_status = 'delivered' then
    if o.status in ('confirmed','processing') then
      perform public._set_order_status(o.id, 'dispatched', null, false);
    end if;
    -- delivered only when every shipment is delivered
    if not exists (select 1 from public.shipments where order_id = o.id and status <> 'delivered') then
      perform public._set_order_status(o.id, 'delivered', null, true);
    end if;
  end if;
  return v_id;
end $$;

create or replace function public.admin_delete_shipment(p_shipment_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  delete from public.shipments where id = p_shipment_id;
end $$;

-- ---------------------------------------------------------------- customer actions
create or replace function public._order_for_actor(p_order uuid, p_guest_token text)
returns public.orders language plpgsql stable security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order;
  if not found then return null; end if;
  if (auth.uid() is not null and o.user_id = auth.uid())
     or (p_guest_token is not null and length(p_guest_token) > 10 and o.guest_token = p_guest_token) then
    return o;
  end if;
  return null;
end $$;
revoke all on function public._order_for_actor(uuid, text) from public, anon, authenticated;

create or replace function public.cancel_own_order(p_order_id uuid, p_guest_token text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  o := public._order_for_actor(p_order_id, p_guest_token);
  if o.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if o.status not in ('placed','payment_pending','payment_failed','confirmed') then
    return jsonb_build_object('ok', false, 'error', 'too_late', 'message', 'This order can no longer be cancelled online. Please contact us.');
  end if;
  perform public._set_order_status(o.id, 'cancelled', 'Cancelled by customer', true);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.request_return(
  p_order_id uuid, p_items jsonb, p_reason text, p_reason_code text default null,
  p_resolution text default 'refund', p_guest_token text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  o public.orders; s public.store_settings; r record; v_ret uuid; v_num text; v_open int; v_item public.order_items;
begin
  o := public._order_for_actor(p_order_id, p_guest_token);
  if o.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  select * into s from public.store_settings;
  if o.status not in ('delivered','return_requested') or o.delivered_at is null then
    return jsonb_build_object('ok', false, 'error', 'not_delivered', 'message', 'Returns can be requested after delivery');
  end if;
  if o.delivered_at < now() - make_interval(days => s.return_window_days) then
    return jsonb_build_object('ok', false, 'error', 'window_closed',
      'message', 'The ' || s.return_window_days || ' day return window has passed');
  end if;
  if coalesce(trim(p_reason), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'reason_required', 'message', 'Please tell us why you are returning');
  end if;
  if p_resolution not in ('refund','replacement','store_credit') then
    return jsonb_build_object('ok', false, 'error', 'bad_resolution');
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', 'no_items', 'message', 'Select at least one item');
  end if;

  v_num := 'RT-' || to_char(now() at time zone 'Asia/Kolkata', 'YYMM') || '-' || nextval('public.return_number_seq');
  insert into public.returns (return_number, order_id, user_id, reason_code, reason, resolution)
  values (v_num, o.id, o.user_id, p_reason_code, left(p_reason, 1000), p_resolution) returning id into v_ret;

  for r in select (e->>'order_item_id')::uuid as item_id, (e->>'quantity')::int as qty, e->>'reason' as reason
             from jsonb_array_elements(p_items) e loop
    select * into v_item from public.order_items where id = r.item_id and order_id = o.id;
    if not found then raise exception 'item does not belong to this order'; end if;
    select coalesce(sum(ri.quantity), 0) into v_open
      from public.return_items ri join public.returns rt on rt.id = ri.return_id
     where ri.order_item_id = v_item.id and rt.status in ('requested','approved','pickup_scheduled','received','refunded')
       and rt.id <> v_ret;
    if r.qty is null or r.qty < 1 or r.qty > v_item.quantity - v_item.returned_qty - v_open then
      raise exception 'invalid return quantity for %', v_item.name;
    end if;
    insert into public.return_items (return_id, order_item_id, quantity, reason)
    values (v_ret, v_item.id, r.qty, left(r.reason, 500));
  end loop;

  if o.status = 'delivered' then perform public._set_order_status(o.id, 'return_requested', p_reason, false); end if;
  perform public._order_event(o.id, 'return_requested', 'Return ' || v_num || ' requested', p_reason);
  perform public._queue_order_email(o.id, 'return_requested', jsonb_build_object('return_number', v_num), o.id || ':rr:' || v_ret);
  perform public._queue_admin_email(o.id, 'admin_attention', jsonb_build_object('reason', 'return requested ' || v_num));
  return jsonb_build_object('ok', true, 'return_id', v_ret, 'return_number', v_num);
end $$;

-- Guests (and customers) look up an order by number + email, or by guest token.
create or replace function public.track_order(
  p_order_number text, p_email text default null, p_guest_token text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where upper(order_number) = upper(trim(p_order_number));
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if not ((auth.uid() is not null and o.user_id = auth.uid())
       or (p_email is not null and lower(trim(p_email)) = lower(o.email))
       or (p_guest_token is not null and p_guest_token = o.guest_token)) then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true,
    'order', to_jsonb(o) - 'guest_token' - 'admin_notes' - 'needs_attention' - 'user_id',
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.name) from public.order_items i where i.order_id = o.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object('at', e.created_at, 'status', e.status, 'title', e.title, 'note', e.note) order by e.created_at)
                         from public.order_events e where e.order_id = o.id and e.customer_visible), '[]'::jsonb),
    'shipments', coalesce((select jsonb_agg(to_jsonb(sh) - 'order_id' order by sh.created_at) from public.shipments sh where sh.order_id = o.id), '[]'::jsonb),
    'returns', coalesce((select jsonb_agg(jsonb_build_object('id', rt.id, 'return_number', rt.return_number, 'status', rt.status,
                          'reason', rt.reason, 'resolution', rt.resolution, 'refund_inr', rt.refund_inr, 'created_at', rt.created_at))
                         from public.returns rt where rt.order_id = o.id), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------------- admin: returns
create or replace function public.admin_decide_return(
  p_return_id uuid, p_action text, p_note text default null, p_refund_inr numeric default null,
  p_tracking_number text default null, p_tracking_url text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rt public.returns; o public.orders; r record; v_amt numeric; v_after int; v_refund uuid; v_open int;
begin
  perform public.require_admin();
  select * into rt from public.returns where id = p_return_id for update;
  if not found then raise exception 'return not found'; end if;
  select * into o from public.orders where id = rt.order_id for update;

  if p_action = 'approve' then
    if rt.status <> 'requested' then raise exception 'return is %', rt.status; end if;
    update public.returns set status = 'approved', admin_note = coalesce(p_note, admin_note) where id = rt.id;
    perform public._queue_order_email(o.id, 'return_approved', jsonb_build_object('return_number', rt.return_number, 'note', p_note), o.id || ':ra:' || rt.id);
  elsif p_action = 'reject' then
    if rt.status not in ('requested','approved') then raise exception 'return is %', rt.status; end if;
    update public.returns set status = 'rejected', admin_note = coalesce(p_note, admin_note) where id = rt.id;
    select count(*) into v_open from public.returns where order_id = o.id and id <> rt.id
       and status in ('requested','approved','pickup_scheduled','received');
    if v_open = 0 and o.status = 'return_requested' then
      perform public._set_order_status(o.id, 'delivered', 'Return rejected', false);
    end if;
    perform public._queue_order_email(o.id, 'return_rejected', jsonb_build_object('return_number', rt.return_number, 'note', p_note), o.id || ':rj:' || rt.id);
  elsif p_action = 'schedule_pickup' then
    if rt.status not in ('approved','pickup_scheduled') then raise exception 'approve the return first'; end if;
    update public.returns set status = 'pickup_scheduled', return_tracking_number = p_tracking_number,
           return_tracking_url = p_tracking_url, admin_note = coalesce(p_note, admin_note) where id = rt.id;
  elsif p_action = 'receive' then
    if rt.status not in ('approved','pickup_scheduled') then raise exception 'return must be approved first'; end if;
    for r in select ri.id, ri.quantity, ri.restock, oi.variant_id, oi.id as item_id
               from public.return_items ri join public.order_items oi on oi.id = ri.order_item_id
              where ri.return_id = rt.id loop
      update public.order_items set returned_qty = returned_qty + r.quantity where id = r.item_id;
      if r.restock and r.variant_id is not null then
        update public.product_variants set stock = stock + r.quantity
         where id = r.variant_id and track_inventory returning stock into v_after;
        if found then
          insert into public.inventory_movements (variant_id, delta, stock_after, reason, order_id, note, created_by)
          values (r.variant_id, r.quantity, v_after, 'return_restock', o.id, 'Return ' || rt.return_number, auth.uid());
        end if;
        update public.return_items set restocked = true where id = r.id;
      end if;
    end loop;
    update public.returns set status = 'received', admin_note = coalesce(p_note, admin_note) where id = rt.id;
    perform public._queue_order_email(o.id, 'return_received', jsonb_build_object('return_number', rt.return_number), o.id || ':rc:' || rt.id);
  elsif p_action = 'refund' then
    if rt.status <> 'received' then raise exception 'mark the return received before refunding'; end if;
    if rt.resolution <> 'refund' then raise exception 'this return is for %, not a refund', rt.resolution; end if;
    select coalesce(sum(round(oi.line_total_inr * ri.quantity / oi.quantity, 2)), 0) into v_amt
      from public.return_items ri join public.order_items oi on oi.id = ri.order_item_id where ri.return_id = rt.id;
    v_amt := coalesce(p_refund_inr, v_amt);
    v_refund := public.admin_create_refund(o.id, v_amt, 'Return ' || rt.return_number, rt.id);
    update public.returns set refund_inr = v_amt, admin_note = coalesce(p_note, admin_note) where id = rt.id;
    if o.status in ('return_requested','delivered') then
      if o.status = 'delivered' then perform public._set_order_status(o.id, 'return_requested', null, false); end if;
      perform public._set_order_status(o.id, 'refund_processing', 'Refund for return ' || rt.return_number, false);
    end if;
    return jsonb_build_object('ok', true, 'refund_id', v_refund, 'amount_inr', v_amt);
  elsif p_action = 'close' then
    update public.returns set status = 'closed', admin_note = coalesce(p_note, admin_note) where id = rt.id;
  else
    raise exception 'unknown action %', p_action;
  end if;
  perform public._order_event(o.id, null, 'Return ' || rt.return_number || ': ' || p_action, p_note, false);
  return jsonb_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- admin: stock
create or replace function public.admin_adjust_stock(
  p_variant_id uuid, p_delta int default null, p_set_to int default null,
  p_reason text default 'manual_adjust', p_note text default null)
returns int language plpgsql security definer set search_path = public as $$
declare v public.product_variants; v_new int;
begin
  perform public.require_admin();
  if p_reason not in ('purchase','manual_adjust','damage','correction','initial') then
    raise exception 'bad reason';
  end if;
  select * into v from public.product_variants where id = p_variant_id for update;
  if not found then raise exception 'variant not found'; end if;
  if (p_delta is null) = (p_set_to is null) then raise exception 'give either delta or set_to'; end if;
  v_new := coalesce(p_set_to, v.stock + p_delta);
  if v_new < 0 and not v.allow_backorder then raise exception 'stock cannot go below zero'; end if;
  update public.product_variants set stock = v_new where id = v.id;
  insert into public.inventory_movements (variant_id, delta, stock_after, reason, note, created_by)
  values (v.id, v_new - v.stock, v_new, p_reason, p_note, auth.uid());
  return v_new;
end $$;

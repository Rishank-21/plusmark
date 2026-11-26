"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/Metrics";
import { ErrorLine, Loading, Pill, Section, SimpleTable, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { db, inr, rpc, when, type Json } from "@/lib/backend/admin";

export default function AdminCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const q = useAdminQuery(async () => {
    const [profile, addresses, orders, consent] = await Promise.all([
      db().from("profiles").select("*").eq("id", id).maybeSingle(),
      db().from("addresses").select("*").eq("user_id", id),
      rpc<{ rows: Json[]; total: number }>("admin_list_orders", { p_filters: { user_id: id, limit: 100 } }),
      db().from("consents").select("analytics,marketing,preferences,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(1)
    ]);
    if (!profile.data) throw new Error("That customer was not found.");
    const stats = await rpc<{ rows: Json[] }>("admin_list_customers", { p_search: (profile.data as Json).email, p_limit: 20, p_offset: 0 });
    return { stats: stats.rows.find((r) => r.id === id) as Json | undefined, p: profile.data as Json, addresses: (addresses.data ?? []) as Json[], orders: orders.rows, consent: (consent.data ?? [])[0] as Json | undefined };
  });
  if (q.error) return <ErrorLine message={q.error} onRetry={q.reload} />;
  if (!q.data) return <Loading what="Loading customer" />;
  const { p, addresses, orders, consent, stats } = q.data;
  // Same figures as the customer list: real sales only, net of refunds.
  return (
    <>
      <AdminPageHeader title={p.full_name || p.email} crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: p.email }]} actions={<>{p.blocked && <Pill tone="red">Blocked</Pill>}</>} />
      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div className="flex flex-col gap-4">
          <Section title="Contact">
            <dl className="grid gap-1 text-body-sm"><dd>{p.email}</dd><dd>{p.phone ?? "No phone saved"}</dd><dd className="text-caption text-muted">Joined {when(p.created_at)}</dd><dd className="text-caption text-muted">Marketing emails: {p.marketing_opt_in ? "yes" : "no"}</dd>
              {consent && <dd className="text-caption text-muted">Cookies: analytics {consent.analytics ? "on" : "off"}, marketing {consent.marketing ? "on" : "off"} ({when(consent.created_at)})</dd>}</dl>
          </Section>
          <Section title="Saved addresses">
            {addresses.length === 0 ? <p className="text-body-sm text-muted">None.</p> : addresses.map((a) => <p key={a.id} className="whitespace-pre-line pb-2 text-body-sm">{`${a.label}: ${a.recipient_name}, ${a.line1}${a.line2 ? ", " + a.line2 : ""}, ${a.city}, ${a.state} ${a.pincode}`}</p>)}
          </Section>
        </div>
        <Section title={`All orders · ${orders.length} placed · ${stats?.orders ?? 0} completed sales · ${inr(stats?.lifetime_value_inr ?? 0)} spent (net of refunds)`}>
          <SimpleTable
            head={["Order", "Placed", "Total", "Status", "Payment"]}
            empty="No orders yet."
            rows={orders.map((o) => [
              <Link key="n" href={`/admin/orders/${o.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{o.order_number}</Link>,
              when(o.placed_at), inr(o.total_inr),
              <Pill key="s" tone={statusTone(o.status)}>{o.status.replace(/_/g, " ")}</Pill>,
              <Pill key="p" tone={statusTone(o.payment_status)}>{o.payment_status.replace(/_/g, " ")}</Pill>
            ])}
          />
        </Section>
      </div>
    </>
  );
}

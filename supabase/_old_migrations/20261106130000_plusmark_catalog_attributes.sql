-- Catalogue attributes introduced with the B2B parity sync.
-- Adds board construction type, writing surface, enquiry-only and data-gap flags,
-- plus the customer-specific customisation note and the published spec table.

alter table public.products
  add column if not exists board_type text not null default 'n/a'
    check (board_type in ('non-magnetic', 'magnetic', 'ceramic', 'n/a')),
  add column if not exists surface_kind text not null default 'other'
    check (surface_kind in ('marker', 'chalk', 'pin-up', 'other')),
  add column if not exists enquiry_only boolean not null default false,
  add column if not exists needs_data boolean not null default false,
  add column if not exists customisation text,
  add column if not exists specs jsonb not null default '[]'::jsonb;

create index if not exists products_needs_data_idx on public.products (needs_data) where needs_data;
create index if not exists products_enquiry_only_idx on public.products (enquiry_only) where enquiry_only;

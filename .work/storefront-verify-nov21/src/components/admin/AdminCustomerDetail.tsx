"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { formatDate, formatInr } from "@/lib/format";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { AdminPageHeader, AdminPanel, StatStrip } from "@/components/admin/Metrics";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { getAdminCustomer } from "@/lib/supabase/admin";

export function AdminCustomerDetail({ customerId }: { customerId: string }) {
  const query = useAdminQuery(() => getAdminCustomer(customerId));

  if (query.loading && !query.data) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-live="polite">
        <span className="sr-only">Loading the customer record</span>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader title="Customer" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: "Customer" }]} />
        <ErrorState title="That customer could not be loaded" body={query.error} onRetry={query.reload} />
      </div>
    );
  }

  if (!query.data) {
    return (
      <EmptyState
        title="Customer record not found"
        body="This account does not exist in Supabase."
        action={{ label: "Back to customers", href: "/admin/customers" }}
      />
    );
  }

  const { customer, addresses, orders } = query.data;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={customer.fullName}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.fullName }
        ]}
        lede={`${customer.email} · joined ${formatDate(customer.joinedAt)}`}
      />

      <StatStrip
        items={[
          { label: "Orders", value: String(orders.length) },
          { label: "Lifetime value", value: formatInr(customer.lifetimeValueInr) },
          { label: "Addresses", value: String(addresses.length) },
          { label: "Role", value: customer.role === "admin" ? "Administrator" : "Customer" },
          { label: "Joined", value: formatDate(customer.joinedAt) }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminPanel title="Orders" description="Server orders linked to this account." padded={false}>
            {orders.length ? (
              <div className="divide-y divide-hair">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-sand/30"
                  >
                    <span>
                      <span className="tabular block font-medium">{order.reference}</span>
                      <span className="text-caption text-graphite">{formatDate(order.placedAt)}</span>
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="tabular text-body-sm font-medium">
                      {order.totals.totalInr === null ? "To confirm" : formatInr(order.totals.totalInr)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState compact title="No orders yet" body="This customer has not placed a server order." />
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Saved addresses" description="Addresses stored in the customer's own address book." padded={false}>
            {addresses.length ? (
              <div className="divide-y divide-hair">
                {addresses.map((address) => (
                  <div key={address.id} className="flex flex-col gap-1 px-4 py-3 text-body-sm">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      {address.label}
                      {address.isDefaultShipping && <Badge tone="navy">Default</Badge>}
                    </span>
                    <span className="text-graphite">{address.recipientName} · {address.phone}</span>
                    <span className="text-caption text-graphite">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState compact title="No saved addresses" body="The customer has not saved a delivery address." />
              </div>
            )}
          </AdminPanel>
        </div>

        <div className="flex flex-col gap-6">
          <AdminPanel title="Contact">
            <div className="flex flex-col gap-3 text-body-sm">
              <span className="flex items-center gap-2">
                <Mail className="size-4 text-graphite" aria-hidden />
                <span className="break-all">{customer.email}</span>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="size-4 text-graphite" aria-hidden />
                {customer.phone ? `+91 ${customer.phone}` : "Not supplied"}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-graphite" aria-hidden />
                {addresses[0] ? `${addresses[0].city}, ${addresses[0].state}` : "No address on file"}
              </span>
            </div>
          </AdminPanel>

          <AdminPanel title="Account context">
            <div className="flex flex-col gap-3 text-body-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-graphite">Role</span>
                <Badge tone={customer.role === "admin" ? "navy" : "neutral"}>{customer.role}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-graphite">Identity</span>
                <span>Supabase Auth</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-graphite">Account ID</span>
                <span className="max-w-[10rem] truncate tabular text-caption" title={customer.id}>{customer.id}</span>
              </div>
            </div>
            <p className="border-t border-hair pt-3 text-caption leading-relaxed text-graphite">
              Roles are protected in Postgres. Granting administrator rights is a SQL operation, not a button on this
              screen.
            </p>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}

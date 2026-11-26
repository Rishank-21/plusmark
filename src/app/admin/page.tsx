"use client";

import Link from "next/link";
import { AdminPageHeader, StatStrip } from "@/components/admin/Metrics";
import { ErrorLine, Loading, Section, SimpleTable, Pill, statusTone } from "@/components/admin/kit";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { inr, rpc, when } from "@/lib/backend/admin";

interface Dashboard {
  orders_today: number;
  revenue_today_inr: number;
  to_ship: number;
  in_transit: number;
  awaiting_payment: number;
  needs_attention: number;
  open_returns: number;
  pending_refunds: number;
  low_stock_variants: number;
  emails_failed: number;
}

export default function AdminDashboardPage() {
  const dash = useAdminQuery(() => rpc<Dashboard>("admin_dashboard"));
  const recent = useAdminQuery(() =>
    rpc<{ rows: Record<string, string>[] }>("admin_list_orders", { p_filters: { limit: 8 } })
  );
  const d = dash.data;
  return (
    <>
      <AdminPageHeader title="Dashboard" crumbs={[{ label: "Admin" }, { label: "Dashboard" }]} lede="What needs doing right now." />
      {dash.error && <ErrorLine message={dash.error} onRetry={dash.reload} />}
      {dash.loading && !d && <Loading />}
      {d && (
        <div className="flex flex-col gap-6">
          <StatStrip
            caption="Today"
            items={[
              { label: "Orders today", value: String(d.orders_today), href: "/admin/orders" },
              { label: "Revenue today", value: inr(d.revenue_today_inr) },
              { label: "To pack and ship", value: String(d.to_ship), href: "/admin/orders?status=confirmed" },
              { label: "On the way", value: String(d.in_transit), href: "/admin/orders?status=dispatched" },
              { label: "Awaiting payment", value: String(d.awaiting_payment), href: "/admin/orders?status=payment_pending" },
              { label: "Needs attention", value: String(d.needs_attention), href: "/admin/orders?attention=1" }
            ]}
          />
          <StatStrip
            caption="Follow ups"
            items={[
              { label: "Open returns", value: String(d.open_returns), href: "/admin/returns" },
              { label: "Refunds to process", value: String(d.pending_refunds), href: "/admin/payments" },
              { label: "Low stock items", value: String(d.low_stock_variants), href: "/admin/inventory?low=1" },
              { label: "Emails failed", value: String(d.emails_failed), href: "/admin/settings" }
            ]}
          />
          <Section title="Latest orders" aside={<Link href="/admin/orders" className="text-caption font-medium text-primary underline-offset-4 hover:underline">All orders</Link>}>
            {recent.loading ? (
              <Loading />
            ) : (
              <SimpleTable
                head={["Order", "Placed", "Customer", "Total", "Status", "Payment"]}
                rows={(recent.data?.rows ?? []).map((o) => [
                  <Link key="n" href={`/admin/orders/${o.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{o.order_number}</Link>,
                  when(o.placed_at),
                  o.customer_name || o.email,
                  inr(o.total_inr),
                  <Pill key="s" tone={statusTone(o.status)}>{o.status.replace(/_/g, " ")}</Pill>,
                  <Pill key="p" tone={statusTone(o.payment_status)}>{o.payment_status.replace(/_/g, " ")}</Pill>
                ])}
              />
            )}
          </Section>
        </div>
      )}
    </>
  );
}

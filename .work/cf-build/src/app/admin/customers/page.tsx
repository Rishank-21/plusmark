"use client";

import { useMemo, useState } from "react";
import { formatDate, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { AdminPageHeader, StatStrip } from "@/components/admin/Metrics";
import { FilterBar, FilterSelect, SearchControl } from "@/components/admin/FilterBar";
import { DataTable, TableLink, type AdminColumn } from "@/components/admin/DataTable";
import { useAdminQuery } from "@/components/admin/useAdminQuery";
import { listAdminCustomers, type AdminCustomer } from "@/lib/supabase/admin";

const ALL = "all";

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState(ALL);
  const data = useAdminQuery<AdminCustomer[]>(() => listAdminCustomers());
  const customers = data.data ?? [];

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      if (role !== ALL && customer.role !== role) return false;
      return !needle || `${customer.fullName} ${customer.email} ${customer.phone ?? ""}`.toLowerCase().includes(needle);
    });
  }, [customers, query, role]);

  const columns: AdminColumn<AdminCustomer>[] = [
    {
      id: "name",
      header: "Customer",
      minWidth: "15rem",
      sortValue: (customer) => customer.fullName,
      render: (customer) => (
        <span className="flex flex-col leading-tight">
          <TableLink href={`/admin/customers/${customer.id}`}>{customer.fullName}</TableLink>
          <span className="text-caption text-graphite">{customer.email}</span>
        </span>
      )
    },
    {
      id: "phone",
      header: "Mobile",
      minWidth: "8rem",
      render: (customer) => (customer.phone ? <span className="tabular">+91 {customer.phone}</span> : <span className="text-graphite">—</span>)
    },
    {
      id: "orders",
      header: "Orders",
      numeric: true,
      minWidth: "4rem",
      sortValue: (customer) => customer.orderCount,
      render: (customer) => customer.orderCount
    },
    {
      id: "ltv",
      header: "Lifetime value",
      numeric: true,
      minWidth: "7.5rem",
      sortValue: (customer) => customer.lifetimeValueInr,
      render: (customer) => formatInr(customer.lifetimeValueInr)
    },
    {
      id: "role",
      header: "Role",
      minWidth: "6rem",
      sortValue: (customer) => customer.role,
      render: (customer) => <Badge tone={customer.role === "admin" ? "navy" : "neutral"}>{customer.role}</Badge>
    },
    {
      id: "joined",
      header: "Joined",
      minWidth: "7rem",
      sortValue: (customer) => customer.joinedAt,
      render: (customer) => <span className="tabular text-caption">{formatDate(customer.joinedAt)}</span>
    }
  ];

  const withOrders = customers.filter((customer) => customer.orderCount > 0).length;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Customers"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers" }]}
        lede="Registered Plusmark accounts from Supabase Auth, with their server order counts and lifetime value. Read-only."
      />

      <StatStrip
        items={[
          { label: "Customers", value: String(customers.length) },
          { label: "With orders", value: String(withOrders) },
          { label: "Administrators", value: String(customers.filter((customer) => customer.role === "admin").length) },
          { label: "Lifetime value", value: formatInr(customers.reduce((sum, customer) => sum + customer.lifetimeValueInr, 0)) },
          { label: "Phones on file", value: String(customers.filter((customer) => customer.phone).length) }
        ]}
      />

      {data.error ? (
        <ErrorState title="Customers could not be loaded" body={data.error} onRetry={data.reload} />
      ) : (
        <>
          <FilterBar
            resultLabel={`${rows.length} of ${customers.length} customer records match`}
            onReset={
              query || role !== ALL
                ? () => {
                    setQuery("");
                    setRole(ALL);
                  }
                : undefined
            }
          >
            <SearchControl
              label="Search customers"
              value={query}
              onChange={setQuery}
              className="grow"
              width="w-full min-w-[16rem]"
              placeholder="Name, email or mobile"
            />
            <FilterSelect
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: ALL, label: "All roles" },
                { value: "customer", label: "Customer" },
                { value: "admin", label: "Administrator" }
              ]}
            />
          </FilterBar>

          <DataTable
            caption="Registered customers with mobile, order count, lifetime value and role"
            columns={columns}
            rows={rows}
            keyFor={(customer) => customer.id}
            resetKey={`${query}|${role}`}
            pageSize={12}
            loading={data.loading}
            defaultSort={{ id: "joined", dir: "desc" }}
            emptyTitle="No customer matches these filters"
            emptyBody="Clear the search or reset the role filter."
          />
        </>
      )}
    </div>
  );
}

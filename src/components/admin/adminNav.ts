import {
  BarChart3,
  Boxes,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LayoutList,
  Package,
  ShoppingBag,
  Star,
  Ticket,
  Settings,
  Undo2,
  Users,
  type LucideIcon
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short line shown under the label in the sidebar on wide screens. */
  note?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/** Every one of the eighteen admin areas, grouped the way the desk works. */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 }
    ]
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/navigation", label: "Header strip", icon: LayoutList },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/reviews", label: "Reviews", icon: Star }
    ]
  },
  {
    title: "Orders",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/returns", label: "Returns", icon: Undo2 },
      { href: "/admin/payments", label: "Payments", icon: CreditCard }
    ]
  },
  {
    title: "Customers",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket }
    ]
  },
  {
    title: "Setup",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }]
  }
];

export const ADMIN_AREA_LABELS: Record<string, string> = {
  "": "Dashboard",
  login: "Sign in",
  products: "Products",
  categories: "Categories",
  navigation: "Header Navigation",
  inventory: "Inventory",
  orders: "Orders",
  returns: "Returns",
  customers: "Customers",
  coupons: "Coupons",
  reviews: "Reviews",
  payments: "Payments",
  reports: "Reports",
  settings: "Settings"
};
export function isAdminArea(segment: string | undefined): boolean {
  return segment !== undefined && Object.prototype.hasOwnProperty.call(ADMIN_AREA_LABELS, segment);
}

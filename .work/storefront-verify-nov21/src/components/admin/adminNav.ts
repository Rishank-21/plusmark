import {
  BarChart3,
  Boxes,
  CreditCard,
  FolderTree,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
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
      { href: "/admin/variants", label: "Variants", icon: Layers },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes }
    ]
  },
  {
    title: "Orders",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/shipping", label: "Shipping", icon: Truck }
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
    title: "Site",
    items: [
      { href: "/admin/content", label: "Content", icon: LayoutTemplate },
      { href: "/admin/reviews", label: "Reviews", icon: Star }
    ]
  }
];

export const ADMIN_AREA_LABELS: Record<string, string> = {
  "": "Dashboard",
  login: "Sign in",
  products: "Products",
  categories: "Categories",
  variants: "Variants",
  inventory: "Inventory",
  orders: "Orders",
  customers: "Customers",
  coupons: "Coupons",
  reviews: "Reviews",
  content: "Content",
  shipping: "Shipping",
  payments: "Payments",
  reports: "Reports"
};

export function isAdminArea(segment: string | undefined): boolean {
  return segment !== undefined && Object.prototype.hasOwnProperty.call(ADMIN_AREA_LABELS, segment);
}

/**
 * Typed shape of the Supabase schema in supabase/migrations.
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MediaRow = {
  id: string;
  public_id: string;
  url: string;
  resource_type: "image" | "video";
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  duration: number | null;
  alt_text: string;
  created_at: string;
  created_by: string | null;
}

export type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: "customer" | "admin";
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryRow = {
  id: string;
  name: string;
  description: string;
  subject: string;
  image: string | null;
  subcategories: Json;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  series_id: string | null;
  subcategory_ids: string[];
  surface: string | null;
  frame: string | null;
  corners: string | null;
  magnetic: boolean;
  double_sided: boolean;
  usage: string;
  blurb: string;
  description: string;
  features: string[];
  media: Json;
  video_id: string | null;
  price_mode: "fixed" | "on_request";
  gst_rate_percent: number;
  hsn_code: string | null;
  bulk_suggestion_quantity: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size_label: string;
  sku: string;
  price_mode: "fixed" | "on_request";
  price_inr: number | null;
  stock: number | null;
  track_inventory: boolean;
  available: boolean;
  lead_time_days: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CouponRow = {
  id: string;
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  minimum_order_inr: number;
  active: boolean;
  starts_at: string;
  ends_at: string;
  usage_limit: number | null;
  used_count: number;
  created_at: string;
  updated_at: string;
}

export type SiteContentRow = {
  key: string;
  value: Json;
  updated_by: string | null;
  updated_at: string;
}

export type ShippingMethodRow = {
  id: string;
  name: string;
  description: string;
  price_inr: number | null;
  eta_min_days: number | null;
  eta_max_days: number | null;
  available: boolean;
  sort_order: number;
  updated_at: string;
}

export type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type SavedBoardRow = {
  user_id: string;
  product_id: string;
  created_at: string;
}

export type ProductReviewRow = {
  id: string;
  product_slug: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

type OrderStatusDb =
  | "placed"
  | "payment_pending"
  | "payment_failed"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "refund_processing"
  | "refunded";

export type OrderRow = {
  id: string;
  user_id: string;
  reference: string;
  contact_email: string;
  status: OrderStatusDb;
  payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  payment_method: "razorpay" | "cod_placeholder" | "quotation_invoice";
  total: number;
  totals: Json;
  shipping_address: Json;
  billing_address: Json;
  coupon_code: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  return_reason: string | null;
  invoice_number: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  variant_label: string | null;
  sku: string | null;
  price: number;
  quantity: number;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          role?: "customer" | "admin";
          marketing_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          role?: "customer" | "admin";
          marketing_opt_in?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: AddressRow;
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          full_name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          landmark?: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          full_name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          landmark?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          is_default?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_boards: {
        Row: SavedBoardRow;
        Insert: { user_id: string; product_id: string; created_at?: string };
        Update: { user_id?: string; product_id?: string };
        Relationships: [];
      };
      product_reviews: {
        Row: ProductReviewRow;
        Insert: {
          id?: string;
          product_slug: string;
          user_id: string;
          author_name: string;
          rating: number;
          title: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string;
          rating?: number;
          title?: string;
          body?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: {
          id?: string;
          user_id: string;
          reference: string;
          contact_email: string;
          status?: OrderStatusDb;
          payment_status?: "unpaid" | "pending" | "paid" | "failed" | "refunded";
          payment_method?: "razorpay" | "cod_placeholder" | "quotation_invoice";
          total?: number;
          totals?: Json;
          shipping_address: Json;
          billing_address: Json;
          coupon_code?: string | null;
          courier_name?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          return_reason?: string | null;
          invoice_number?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatusDb;
          payment_status?: "unpaid" | "pending" | "paid" | "failed" | "refunded";
          courier_name?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          return_reason?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          event_id: string;
          provider: string;
          event_type: string;
          payload: Json;
          received_at: string;
        };
        Insert: {
          event_id: string;
          provider?: string;
          event_type: string;
          payload: Json;
          received_at?: string;
        };
        Update: {
          event_id?: string;
          provider?: string;
          event_type?: string;
          payload?: Json;
        };
        Relationships: [];
      };

      media: {
        Row: MediaRow;
        Insert: {
          id?: string; public_id: string; url: string; resource_type: "image" | "video";
          format?: string | null; width?: number | null; height?: number | null;
          bytes?: number | null; duration?: number | null; alt_text?: string; created_by?: string | null;
        };
        Update: {
          public_id?: string; url?: string; resource_type?: "image" | "video";
          format?: string | null; width?: number | null; height?: number | null;
          bytes?: number | null; duration?: number | null; alt_text?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: { id: string; name: string; description?: string; subject?: string; image?: string | null; subcategories?: Json; sort_order?: number };
        Update: { id?: string; name?: string; description?: string; subject?: string; image?: string | null; subcategories?: Json; sort_order?: number };
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: {
          id?: string; slug: string; name: string; category_id: string; series_id?: string | null;
          subcategory_ids?: string[]; surface?: string | null; frame?: string | null; corners?: string | null;
          magnetic?: boolean; double_sided?: boolean; usage?: string; blurb?: string; description?: string;
          features?: string[]; media?: Json; video_id?: string | null; price_mode?: "fixed" | "on_request";
          gst_rate_percent?: number; hsn_code?: string | null; bulk_suggestion_quantity?: number;
          published?: boolean; featured?: boolean;
        };
        Update: {
          slug?: string; name?: string; category_id?: string; series_id?: string | null;
          subcategory_ids?: string[]; surface?: string | null; frame?: string | null; corners?: string | null;
          magnetic?: boolean; double_sided?: boolean; usage?: string; blurb?: string; description?: string;
          features?: string[]; media?: Json; video_id?: string | null; price_mode?: "fixed" | "on_request";
          gst_rate_percent?: number; hsn_code?: string | null; bulk_suggestion_quantity?: number;
          published?: boolean; featured?: boolean;
        };
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariantRow;
        Insert: {
          id?: string; product_id: string; size_label: string; sku: string; price_mode?: "fixed" | "on_request";
          price_inr?: number | null; stock?: number | null; track_inventory?: boolean; available?: boolean;
          lead_time_days?: number | null; sort_order?: number;
        };
        Update: {
          size_label?: string; sku?: string; price_mode?: "fixed" | "on_request"; price_inr?: number | null;
          stock?: number | null; track_inventory?: boolean; available?: boolean; lead_time_days?: number | null; sort_order?: number;
        };
        Relationships: [];
      };
      coupons: {
        Row: CouponRow;
        Insert: { id?: string; code: string; description?: string; kind: "percent" | "flat"; value: number; minimum_order_inr?: number; active?: boolean; starts_at?: string; ends_at?: string; usage_limit?: number | null; used_count?: number };
        Update: { code?: string; description?: string; kind?: "percent" | "flat"; value?: number; minimum_order_inr?: number; active?: boolean; starts_at?: string; ends_at?: string; usage_limit?: number | null; used_count?: number };
        Relationships: [];
      };
      site_content: {
        Row: SiteContentRow;
        Insert: { key: string; value: Json; updated_by?: string | null };
        Update: { value?: Json; updated_by?: string | null };
        Relationships: [];
      };
      shipping_methods: {
        Row: ShippingMethodRow;
        Insert: { id: string; name: string; description?: string; price_inr?: number | null; eta_min_days?: number | null; eta_max_days?: number | null; available?: boolean; sort_order?: number };
        Update: { name?: string; description?: string; price_inr?: number | null; eta_min_days?: number | null; eta_max_days?: number | null; available?: boolean; sort_order?: number };
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          name: string;
          variant_label?: string | null;
          sku?: string | null;
          price: number;
          quantity: number;
        };
        Update: {
          product_id?: string;
          name?: string;
          price?: number;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      phone_in_use: { Args: { p_phone: string }; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      place_order: {
        Args: {
          p_reference: string;
          p_contact_email: string;
          p_payment_method: string;
          p_shipping_method_id: string;
          p_shipping_address: Json;
          p_billing_address: Json;
          p_coupon_code: string | null;
          p_items: Json;
        };
        Returns: OrderRow;
      };
      cancel_own_order: { Args: { p_order_id: string }; Returns: OrderRow };
      request_order_return: { Args: { p_order_id: string; p_reason: string }; Returns: OrderRow };
      confirm_razorpay_payment: {
        Args: { p_order_id: string; p_razorpay_order_id: string; p_payment_id: string; p_signature: string };
        Returns: OrderRow;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          query?: string
          extensions?: Json
          operationName?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default_billing: boolean
          is_default_shipping: boolean
          label: string
          landmark: string | null
          line1: string
          line2: string | null
          phone: string
          pincode: string
          recipient_name: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          label?: string
          landmark?: string | null
          line1: string
          line2?: string | null
          phone: string
          pincode: string
          recipient_name: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          label?: string
          landmark?: string | null
          line1?: string
          line2?: string | null
          phone?: string
          pincode?: string
          recipient_name?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      carriers: {
        Row: {
          active: boolean
          id: string
          name: string
          tracking_url_template: string | null
        }
        Insert: {
          active?: boolean
          id: string
          name: string
          tracking_url_template?: string | null
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          tracking_url_template?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          default_gst_rate: number | null
          description: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          sort_order: number
          subject: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_gst_rate?: number | null
          description?: string | null
          id: string
          image?: string | null
          name: string
          parent_id?: string | null
          sort_order?: number
          subject?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_gst_rate?: number | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          sort_order?: number
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          analytics: boolean
          anon_id: string | null
          created_at: string
          id: string
          marketing: boolean
          necessary: boolean
          policy_version: string
          preferences: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics?: boolean
          anon_id?: string | null
          created_at?: string
          id?: string
          marketing?: boolean
          necessary?: boolean
          policy_version?: string
          preferences?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics?: boolean
          anon_id?: string | null
          created_at?: string
          id?: string
          marketing?: boolean
          necessary?: boolean
          policy_version?: string
          preferences?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupon_recipients: {
        Row: {
          coupon_id: string
          email: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          email?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          email?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_recipients_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_inr: number
          email: string
          id: string
          order_id: string
          user_id: string | null
          voided: boolean
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_inr: number
          email: string
          id?: string
          order_id: string
          user_id?: string | null
          voided?: boolean
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_inr?: number
          email?: string
          id?: string
          order_id?: string
          user_id?: string | null
          voided?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          audience: string
          category_ids: string[]
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          kind: string
          max_discount_inr: number | null
          min_order_inr: number
          per_user_limit: number | null
          product_ids: string[]
          starts_at: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          audience?: string
          category_ids?: string[]
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          kind: string
          max_discount_inr?: number | null
          min_order_inr?: number
          per_user_limit?: number | null
          product_ids?: string[]
          starts_at?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Update: {
          active?: boolean
          audience?: string
          category_ids?: string[]
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          max_discount_inr?: number | null
          min_order_inr?: number
          per_user_limit?: number | null
          product_ids?: string[]
          starts_at?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          attempts: number
          created_at: string
          dedupe_key: string | null
          error: string | null
          id: string
          order_id: string | null
          payload: Json
          provider_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template: string
          to_email: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          dedupe_key?: string | null
          error?: string | null
          id?: string
          order_id?: string | null
          payload?: Json
          provider_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template: string
          to_email: string
        }
        Update: {
          attempts?: number
          created_at?: string
          dedupe_key?: string | null
          error?: string | null
          id?: string
          order_id?: string | null
          payload?: Json
          provider_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_outbox_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          delta: number
          id: number
          note: string | null
          order_id: string | null
          reason: string
          stock_after: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta: number
          id?: never
          note?: string | null
          order_id?: string | null
          reason: string
          stock_after: number
          variant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: never
          note?: string | null
          order_id?: string | null
          reason?: string
          stock_after?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          created_by: string | null
          customer_visible: boolean
          id: number
          note: string | null
          order_id: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_visible?: boolean
          id?: never
          note?: string | null
          order_id: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_visible?: boolean
          id?: never
          note?: string | null
          order_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          discount_inr: number
          gst_inr: number
          gst_rate: number
          hsn_code: string | null
          id: string
          image: string | null
          line_amount_inr: number
          line_total_inr: number
          name: string
          options: Json
          order_id: string
          product_id: string | null
          quantity: number
          returned_qty: number
          sku: string
          slug: string | null
          taxable_inr: number
          unit_price_inr: number
          variant_id: string | null
          variant_label: string | null
        }
        Insert: {
          discount_inr?: number
          gst_inr: number
          gst_rate: number
          hsn_code?: string | null
          id?: string
          image?: string | null
          line_amount_inr: number
          line_total_inr: number
          name: string
          options?: Json
          order_id: string
          product_id?: string | null
          quantity: number
          returned_qty?: number
          sku: string
          slug?: string | null
          taxable_inr: number
          unit_price_inr: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Update: {
          discount_inr?: number
          gst_inr?: number
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          image?: string | null
          line_amount_inr?: number
          line_total_inr?: number
          name?: string
          options?: Json
          order_id?: string
          product_id?: string | null
          quantity?: number
          returned_qty?: number
          sku?: string
          slug?: string | null
          taxable_inr?: number
          unit_price_inr?: number
          variant_id?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_address: Json
          cancelled_at: string | null
          cgst_inr: number
          cod_fee_inr: number
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          currency: string
          customer_name: string | null
          delivered_at: string | null
          discount_inr: number
          dispatched_at: string | null
          email: string
          gst_inr: number
          guest_token: string
          id: string
          igst_inr: number
          invoice_number: string | null
          needs_attention: string | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_method: string
          payment_status: string
          phone: string
          placed_at: string
          prices_include_gst: boolean
          refunded_inr: number
          sgst_inr: number
          shipping_address: Json
          shipping_inr: number
          status: string
          stock_released: boolean
          subtotal_inr: number
          taxable_inr: number
          total_inr: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_address: Json
          cancelled_at?: string | null
          cgst_inr?: number
          cod_fee_inr?: number
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_name?: string | null
          delivered_at?: string | null
          discount_inr?: number
          dispatched_at?: string | null
          email: string
          gst_inr: number
          guest_token?: string
          id?: string
          igst_inr?: number
          invoice_number?: string | null
          needs_attention?: string | null
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          phone: string
          placed_at?: string
          prices_include_gst?: boolean
          refunded_inr?: number
          sgst_inr?: number
          shipping_address: Json
          shipping_inr?: number
          status?: string
          stock_released?: boolean
          subtotal_inr: number
          taxable_inr: number
          total_inr: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_address?: Json
          cancelled_at?: string | null
          cgst_inr?: number
          cod_fee_inr?: number
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_name?: string | null
          delivered_at?: string | null
          discount_inr?: number
          dispatched_at?: string | null
          email?: string
          gst_inr?: number
          guest_token?: string
          id?: string
          igst_inr?: number
          invoice_number?: string | null
          needs_attention?: string | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          phone?: string
          placed_at?: string
          prices_include_gst?: boolean
          refunded_inr?: number
          sgst_inr?: number
          shipping_address?: Json
          shipping_inr?: number
          status?: string
          stock_released?: boolean
          subtotal_inr?: number
          taxable_inr?: number
          total_inr?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          error: string | null
          event: string
          id: string
          payload: Json
          processed: boolean
          received_at: string
        }
        Insert: {
          error?: string | null
          event: string
          id: string
          payload: Json
          processed?: boolean
          received_at?: string
        }
        Update: {
          error?: string | null
          event?: string
          id?: string
          payload?: Json
          processed?: boolean
          received_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_inr: number
          created_at: string
          error_code: string | null
          error_description: string | null
          id: string
          method: string | null
          order_id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          raw: Json | null
          signature_verified: boolean
          status: string
          updated_at: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          error_code?: string | null
          error_description?: string | null
          id?: string
          method?: string | null
          order_id: string
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          raw?: Json | null
          signature_verified?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          error_code?: string | null
          error_description?: string | null
          id?: string
          method?: string | null
          order_id?: string
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          raw?: Json | null
          signature_verified?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt: string | null
          height: number | null
          id: string
          product_id: string
          public_id: string
          sort_order: number
          source: string
          width: number | null
        }
        Insert: {
          alt?: string | null
          height?: number | null
          id?: string
          product_id: string
          public_id: string
          sort_order?: number
          source?: string
          width?: number | null
        }
        Update: {
          alt?: string | null
          height?: number | null
          id?: string
          product_id?: string
          public_id?: string
          sort_order?: number
          source?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_values: {
        Row: {
          height_cm: number | null
          id: string
          option_id: string
          sort_order: number
          swatch_hex: string | null
          value: string
          width_cm: number | null
        }
        Insert: {
          height_cm?: number | null
          id?: string
          option_id: string
          sort_order?: number
          swatch_hex?: string | null
          value: string
          width_cm?: number | null
        }
        Update: {
          height_cm?: number | null
          id?: string
          option_id?: string
          sort_order?: number
          swatch_hex?: string | null
          value?: string
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          kind: string
          name: string
          product_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          kind?: string
          name: string
          product_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          kind?: string
          name?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          allow_backorder: boolean
          available: boolean
          barcode: string | null
          compare_at_inr: number | null
          created_at: string
          id: string
          image_public_id: string | null
          lead_time_days: number | null
          low_stock_threshold: number | null
          options: Json
          pack_qty: number
          price_inr: number | null
          price_mode: string
          product_id: string
          sku: string
          sort_order: number
          stock: number
          title: string
          track_inventory: boolean
          updated_at: string
          weight_g: number | null
        }
        Insert: {
          allow_backorder?: boolean
          available?: boolean
          barcode?: string | null
          compare_at_inr?: number | null
          created_at?: string
          id?: string
          image_public_id?: string | null
          lead_time_days?: number | null
          low_stock_threshold?: number | null
          options?: Json
          pack_qty?: number
          price_inr?: number | null
          price_mode?: string
          product_id: string
          sku: string
          sort_order?: number
          stock?: number
          title: string
          track_inventory?: boolean
          updated_at?: string
          weight_g?: number | null
        }
        Update: {
          allow_backorder?: boolean
          available?: boolean
          barcode?: string | null
          compare_at_inr?: number | null
          created_at?: string
          id?: string
          image_public_id?: string | null
          lead_time_days?: number | null
          low_stock_threshold?: number | null
          options?: Json
          pack_qty?: number
          price_inr?: number | null
          price_mode?: string
          product_id?: string
          sku?: string
          sort_order?: number
          stock?: number
          title?: string
          track_inventory?: boolean
          updated_at?: string
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          attributes: Json
          blurb: string | null
          board_type: string
          brand: string | null
          bulk_suggestion_quantity: number
          category_id: string
          corners: string | null
          created_at: string
          customisation: string | null
          deleted_at: string | null
          description: string | null
          double_sided: boolean
          enquiry_only: boolean
          featured: boolean
          features: string[]
          frame: string | null
          gst_rate: number
          hsn_code: string | null
          id: string
          magnetic: boolean
          minimum_order_quantity: number
          name: string
          needs_data: boolean
          price_mode: string
          published: boolean
          search: unknown | null
          series_id: string | null
          slug: string
          sort_order: number
          specs: Json
          subcategory_ids: string[]
          surface: string | null
          surface_kind: string
          tags: string[]
          updated_at: string
          usage: string | null
          video_id: string | null
        }
        Insert: {
          attributes?: Json
          blurb?: string | null
          board_type?: string
          brand?: string | null
          bulk_suggestion_quantity?: number
          category_id: string
          corners?: string | null
          created_at?: string
          customisation?: string | null
          deleted_at?: string | null
          description?: string | null
          double_sided?: boolean
          enquiry_only?: boolean
          featured?: boolean
          features?: string[]
          frame?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          magnetic?: boolean
          minimum_order_quantity?: number
          name: string
          needs_data?: boolean
          price_mode?: string
          published?: boolean
          search?: unknown | null
          series_id?: string | null
          slug: string
          sort_order?: number
          specs?: Json
          subcategory_ids?: string[]
          surface?: string | null
          surface_kind?: string
          tags?: string[]
          updated_at?: string
          usage?: string | null
          video_id?: string | null
        }
        Update: {
          attributes?: Json
          blurb?: string | null
          board_type?: string
          brand?: string | null
          bulk_suggestion_quantity?: number
          category_id?: string
          corners?: string | null
          created_at?: string
          customisation?: string | null
          deleted_at?: string | null
          description?: string | null
          double_sided?: boolean
          enquiry_only?: boolean
          featured?: boolean
          features?: string[]
          frame?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          magnetic?: boolean
          minimum_order_quantity?: number
          name?: string
          needs_data?: boolean
          price_mode?: string
          published?: boolean
          search?: unknown | null
          series_id?: string | null
          slug?: string
          sort_order?: number
          specs?: Json
          subcategory_ids?: string[]
          surface?: string | null
          surface_kind?: string
          tags?: string[]
          updated_at?: string
          usage?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          blocked: boolean
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          marketing_opt_in: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          marketing_opt_in?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          marketing_opt_in?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount_inr: number
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          order_id: string
          payment_id: string | null
          processed_at: string | null
          provider_refund_id: string | null
          reason: string | null
          return_id: string | null
          status: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          order_id: string
          payment_id?: string | null
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          return_id?: string | null
          status?: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          order_id?: string
          payment_id?: string | null
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          return_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          id: string
          order_item_id: string
          quantity: number
          reason: string | null
          restock: boolean
          restocked: boolean
          return_id: string
        }
        Insert: {
          id?: string
          order_item_id: string
          quantity: number
          reason?: string | null
          restock?: boolean
          restocked?: boolean
          return_id: string
        }
        Update: {
          id?: string
          order_item_id?: string
          quantity?: number
          reason?: string | null
          restock?: boolean
          restocked?: boolean
          return_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          order_id: string
          reason: string
          reason_code: string | null
          refund_inr: number | null
          resolution: string
          return_number: string
          return_tracking_number: string | null
          return_tracking_url: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          order_id: string
          reason: string
          reason_code?: string | null
          refund_inr?: number | null
          resolution?: string
          return_number: string
          return_tracking_number?: string | null
          return_tracking_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          order_id?: string
          reason?: string
          reason_code?: string | null
          refund_inr?: number | null
          resolution?: string
          return_number?: string
          return_tracking_number?: string | null
          return_tracking_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          corners: string | null
          frame: string | null
          id: string
          name: string
          rank: number
          sizes: string[]
          surface: string | null
        }
        Insert: {
          corners?: string | null
          frame?: string | null
          id: string
          name: string
          rank?: number
          sizes?: string[]
          surface?: string | null
        }
        Update: {
          corners?: string | null
          frame?: string | null
          id?: string
          name?: string
          rank?: number
          sizes?: string[]
          surface?: string | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier_id: string | null
          carrier_name: string | null
          created_at: string
          delivered_at: string | null
          eta_from: string | null
          eta_to: string | null
          id: string
          note: string | null
          order_id: string
          shipped_at: string | null
          status: string
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          carrier_id?: string | null
          carrier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          eta_from?: string | null
          eta_to?: string | null
          id?: string
          note?: string | null
          order_id: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          carrier_id?: string | null
          carrier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          eta_from?: string | null
          eta_to?: string | null
          id?: string
          note?: string | null
          order_id?: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          eta_max_days: number | null
          eta_min_days: number | null
          fee_inr: number
          state: string
        }
        Insert: {
          eta_max_days?: number | null
          eta_min_days?: number | null
          fee_inr: number
          state: string
        }
        Update: {
          eta_max_days?: number | null
          eta_min_days?: number | null
          fee_inr?: number
          state?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          cod_enabled: boolean
          cod_fee_inr: number
          free_shipping_over_inr: number | null
          id: boolean
          invoice_prefix: string
          low_stock_default: number
          price_includes_gst: boolean
          return_window_days: number
          seller_address: string | null
          seller_email: string | null
          seller_gstin: string | null
          seller_name: string
          seller_phone: string | null
          seller_state: string
          shipping_flat_inr: number
          shipping_gst_rate: number
          unpaid_order_expiry_minutes: number
          updated_at: string
        }
        Insert: {
          cod_enabled?: boolean
          cod_fee_inr?: number
          free_shipping_over_inr?: number | null
          id?: boolean
          invoice_prefix?: string
          low_stock_default?: number
          price_includes_gst?: boolean
          return_window_days?: number
          seller_address?: string | null
          seller_email?: string | null
          seller_gstin?: string | null
          seller_name?: string
          seller_phone?: string | null
          seller_state?: string
          shipping_flat_inr?: number
          shipping_gst_rate?: number
          unpaid_order_expiry_minutes?: number
          updated_at?: string
        }
        Update: {
          cod_enabled?: boolean
          cod_fee_inr?: number
          free_shipping_over_inr?: number | null
          id?: boolean
          invoice_prefix?: string
          low_stock_default?: number
          price_includes_gst?: boolean
          return_window_days?: number
          seller_address?: string | null
          seller_email?: string | null
          seller_gstin?: string | null
          seller_name?: string
          seller_phone?: string | null
          seller_state?: string
          shipping_flat_inr?: number
          shipping_gst_rate?: number
          unpaid_order_expiry_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      variant_costs: {
        Row: {
          cost_inr: number
          variant_id: string
        }
        Insert: {
          cost_inr: number
          variant_id: string
        }
        Update: {
          cost_inr?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_costs_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_listing: {
        Row: {
          attributes: Json | null
          blurb: string | null
          board_type: string | null
          brand: string | null
          bulk_suggestion_quantity: number | null
          category_id: string | null
          corners: string | null
          cover_image: string | null
          created_at: string | null
          customisation: string | null
          deleted_at: string | null
          description: string | null
          double_sided: boolean | null
          enquiry_only: boolean | null
          featured: boolean | null
          features: string[] | null
          frame: string | null
          gst_rate: number | null
          hsn_code: string | null
          id: string | null
          in_stock: boolean | null
          magnetic: boolean | null
          max_price_inr: number | null
          min_price_inr: number | null
          minimum_order_quantity: number | null
          name: string | null
          needs_data: boolean | null
          price_mode: string | null
          published: boolean | null
          search: unknown | null
          series_id: string | null
          slug: string | null
          sort_order: number | null
          specs: Json | null
          subcategory_ids: string[] | null
          surface: string | null
          surface_kind: string | null
          tags: string[] | null
          updated_at: string | null
          usage: string | null
          video_id: string | null
        }
        Insert: {
          attributes?: Json | null
          blurb?: string | null
          board_type?: string | null
          brand?: string | null
          bulk_suggestion_quantity?: number | null
          category_id?: string | null
          corners?: string | null
          cover_image?: never
          created_at?: string | null
          customisation?: string | null
          deleted_at?: string | null
          description?: string | null
          double_sided?: boolean | null
          enquiry_only?: boolean | null
          featured?: boolean | null
          features?: string[] | null
          frame?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string | null
          in_stock?: never
          magnetic?: boolean | null
          max_price_inr?: never
          min_price_inr?: never
          minimum_order_quantity?: number | null
          name?: string | null
          needs_data?: boolean | null
          price_mode?: string | null
          published?: boolean | null
          search?: unknown | null
          series_id?: string | null
          slug?: string | null
          sort_order?: number | null
          specs?: Json | null
          subcategory_ids?: string[] | null
          surface?: string | null
          surface_kind?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage?: string | null
          video_id?: string | null
        }
        Update: {
          attributes?: Json | null
          blurb?: string | null
          board_type?: string | null
          brand?: string | null
          bulk_suggestion_quantity?: number | null
          category_id?: string | null
          corners?: string | null
          cover_image?: never
          created_at?: string | null
          customisation?: string | null
          deleted_at?: string | null
          description?: string | null
          double_sided?: boolean | null
          enquiry_only?: boolean | null
          featured?: boolean | null
          features?: string[] | null
          frame?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string | null
          in_stock?: never
          magnetic?: boolean | null
          max_price_inr?: never
          min_price_inr?: never
          minimum_order_quantity?: number | null
          name?: string | null
          needs_data?: boolean | null
          price_mode?: string | null
          published?: boolean | null
          search?: unknown | null
          series_id?: string | null
          slug?: string | null
          sort_order?: number | null
          specs?: Json | null
          subcategory_ids?: string[] | null
          surface?: string | null
          surface_kind?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _assign_invoice: {
        Args: { p_order: string }
        Returns: undefined
      }
      _email_subject: {
        Args: { p_number: string; p_template: string }
        Returns: string
      }
      _generate_variants: {
        Args: {
          p_price_by_value?: Json
          p_stock?: number
          p_cost_inr?: number
          p_product_id: string
          p_base_price_inr: number
        }
        Returns: number
      }
      _gst_split: {
        Args: { p_amount: number; p_rate: number; p_inclusive: boolean }
        Returns: Record<string, unknown>
      }
      _order_email_payload: {
        Args: { p_order: string }
        Returns: Json
      }
      _order_event: {
        Args: {
          p_visible?: boolean
          p_order: string
          p_status: string
          p_title: string
          p_note?: string
        }
        Returns: undefined
      }
      _order_for_actor: {
        Args: { p_order: string; p_guest_token: string }
        Returns: {
          admin_notes: string | null
          billing_address: Json
          cancelled_at: string | null
          cgst_inr: number
          cod_fee_inr: number
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          currency: string
          customer_name: string | null
          delivered_at: string | null
          discount_inr: number
          dispatched_at: string | null
          email: string
          gst_inr: number
          guest_token: string
          id: string
          igst_inr: number
          invoice_number: string | null
          needs_attention: string | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_method: string
          payment_status: string
          phone: string
          placed_at: string
          prices_include_gst: boolean
          refunded_inr: number
          sgst_inr: number
          shipping_address: Json
          shipping_inr: number
          status: string
          stock_released: boolean
          subtotal_inr: number
          taxable_inr: number
          total_inr: number
          updated_at: string
          user_id: string | null
        }
      }
      _order_release_stock: {
        Args: { p_reason?: string; p_order: string }
        Returns: undefined
      }
      _order_reserve_stock: {
        Args: { p_order: string }
        Returns: boolean
      }
      _owns_order: {
        Args: { p_order: string }
        Returns: boolean
      }
      _queue_admin_email: {
        Args: { p_extra?: Json; p_template: string; p_order: string }
        Returns: undefined
      }
      _queue_order_email: {
        Args: {
          p_template: string
          p_order: string
          p_dedupe?: string
          p_extra?: Json
        }
        Returns: undefined
      }
      _rep_range: {
        Args: { p_to: string; p_from: string }
        Returns: Record<string, unknown>
      }
      _set_order_status: {
        Args: {
          p_order: string
          p_note: string
          p_notify: boolean
          p_status: string
        }
        Returns: undefined
      }
      _validate_address: {
        Args: { p_addr: Json }
        Returns: undefined
      }
      admin_adjust_stock: {
        Args: {
          p_delta?: number
          p_note?: string
          p_reason?: string
          p_set_to?: number
          p_variant_id: string
        }
        Returns: number
      }
      admin_create_refund: {
        Args: {
          p_return_id?: string
          p_order_id: string
          p_amount_inr: number
          p_reason: string
        }
        Returns: string
      }
      admin_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_decide_return: {
        Args: {
          p_note?: string
          p_return_id: string
          p_tracking_url?: string
          p_tracking_number?: string
          p_refund_inr?: number
          p_action: string
        }
        Returns: Json
      }
      admin_delete_product: {
        Args: { p_hard?: boolean; p_product_id: string }
        Returns: string
      }
      admin_delete_shipment: {
        Args: { p_shipment_id: string }
        Returns: undefined
      }
      admin_generate_variants: {
        Args: {
          p_product_id: string
          p_base_price_inr: number
          p_price_by_value?: Json
          p_stock?: number
          p_cost_inr?: number
        }
        Returns: number
      }
      admin_get_order: {
        Args: { p_order_id: string }
        Returns: Json
      }
      admin_list_customers: {
        Args: { p_search?: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_list_orders: {
        Args: { p_filters?: Json }
        Returns: Json
      }
      admin_mark_refund_done: {
        Args: { p_reference?: string; p_refund_id: string }
        Returns: undefined
      }
      admin_record_payment: {
        Args: {
          p_reference?: string
          p_order_id: string
          p_amount_inr: number
          p_method: string
        }
        Returns: undefined
      }
      admin_resolve_attention: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      admin_restore_product: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      admin_set_coupon_recipients: {
        Args: { p_emails: string[]; p_user_ids?: string[]; p_coupon_id: string }
        Returns: number
      }
      admin_set_customer_blocked: {
        Args: { p_blocked: boolean; p_user_id: string }
        Returns: undefined
      }
      admin_set_order_notes: {
        Args: { p_admin_notes: string; p_order_id: string }
        Returns: undefined
      }
      admin_set_shipment: {
        Args: {
          p_order_id: string
          p_status?: string
          p_eta_from?: string
          p_eta_to?: string
          p_note?: string
          p_shipment_id?: string
          p_tracking_url: string
          p_tracking_number: string
          p_carrier_name: string
          p_carrier_id: string
        }
        Returns: string
      }
      admin_update_order_status: {
        Args: {
          p_notify?: boolean
          p_status: string
          p_order_id: string
          p_note?: string
        }
        Returns: undefined
      }
      admin_upsert_product: {
        Args: { p: Json }
        Returns: string
      }
      cancel_own_order: {
        Args: { p_guest_token?: string; p_order_id: string }
        Returns: Json
      }
      complete_refund: {
        Args: {
          p_refund_id: string
          p_ok: boolean
          p_provider_refund_id: string
          p_error?: string
        }
        Returns: undefined
      }
      compute_cart: {
        Args: {
          p_payment_method?: string
          p_items: Json
          p_user: string
          p_state: string
          p_coupon: string
          p_email: string
        }
        Returns: Json
      }
      confirm_payment: {
        Args: {
          p_provider_payment_id: string
          p_provider_order_id: string
          p_raw?: Json
          p_order_id: string
          p_signature_verified: boolean
          p_method: string
          p_amount_paise: number
        }
        Returns: Json
      }
      expire_unpaid_orders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_public_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      place_order: {
        Args: {
          p_notes?: string
          p_payment_method?: string
          p_customer_name: string
          p_items: Json
          p_email: string
          p_phone: string
          p_shipping_address: Json
          p_billing_address?: Json
          p_coupon?: string
        }
        Returns: Json
      }
      quote_cart: {
        Args: {
          p_payment_method?: string
          p_items: Json
          p_coupon?: string
          p_state?: string
          p_email?: string
        }
        Returns: Json
      }
      record_consent: {
        Args: {
          p_user_agent?: string
          p_policy_version?: string
          p_marketing: boolean
          p_analytics: boolean
          p_anon_id: string
          p_preferences: boolean
        }
        Returns: string
      }
      record_payment_failure: {
        Args: {
          p_error_code: string
          p_provider_order_id: string
          p_order_id: string
          p_raw?: Json
          p_error_description: string
          p_provider_payment_id: string
        }
        Returns: undefined
      }
      register_payment_attempt: {
        Args: {
          p_order_id: string
          p_amount_inr: number
          p_provider_order_id: string
        }
        Returns: string
      }
      report_category_sales: {
        Args: { p_to?: string; p_from?: string }
        Returns: Json
      }
      report_cohorts: {
        Args: { p_months?: number }
        Returns: Json
      }
      report_coupons: {
        Args: { p_from?: string; p_to?: string }
        Returns: Json
      }
      report_customers: {
        Args: { p_from?: string; p_to?: string; p_limit?: number }
        Returns: Json
      }
      report_fulfilment: {
        Args: { p_to?: string; p_from?: string }
        Returns: Json
      }
      report_geo: {
        Args: { p_to?: string; p_from?: string }
        Returns: Json
      }
      report_gst: {
        Args: { p_from?: string; p_to?: string }
        Returns: Json
      }
      report_inventory: {
        Args: { p_only_low?: boolean }
        Returns: Json
      }
      report_payments: {
        Args: { p_from?: string; p_to?: string }
        Returns: Json
      }
      report_returns: {
        Args: { p_from?: string; p_to?: string }
        Returns: Json
      }
      report_sales: {
        Args: { p_group?: string; p_from?: string; p_to?: string }
        Returns: Json
      }
      report_time_patterns: {
        Args: { p_to?: string; p_from?: string }
        Returns: Json
      }
      report_top_products: {
        Args: {
          p_to?: string
          p_by?: string
          p_from?: string
          p_limit?: number
        }
        Returns: Json
      }
      report_variant_options: {
        Args: { p_to?: string; p_from?: string }
        Returns: Json
      }
      request_return: {
        Args: {
          p_guest_token?: string
          p_order_id: string
          p_resolution?: string
          p_reason_code?: string
          p_reason: string
          p_items: Json
        }
        Returns: Json
      }
      require_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      track_order: {
        Args: {
          p_order_number: string
          p_guest_token?: string
          p_email?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


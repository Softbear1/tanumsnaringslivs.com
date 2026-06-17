import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          bg_color: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          color: string;
          bg_color: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string;
          bg_color?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          category_id: string;
          description: string;
          phone: string;
          email: string;
          website: string | null;
          address: string;
          initials: string;
          boosted: boolean;
          featured: boolean;
          rating: number;
          review_count: number;
          active: boolean;
          created_at: string;
          owner_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category_id: string;
          description: string;
          phone: string;
          email: string;
          website?: string | null;
          address: string;
          initials: string;
          boosted?: boolean;
          featured?: boolean;
          rating?: number;
          review_count?: number;
          active?: boolean;
          created_at?: string;
          owner_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string;
          description?: string;
          phone?: string;
          email?: string;
          website?: string | null;
          address?: string;
          initials?: string;
          boosted?: boolean;
          featured?: boolean;
          rating?: number;
          review_count?: number;
          active?: boolean;
          created_at?: string;
          owner_id?: string | null;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          id: number;
          viewed_at: string;
          business_id: string | null;
        };
        Insert: {
          id?: number;
          viewed_at?: string;
          business_id?: string | null;
        };
        Update: {
          id?: number;
          viewed_at?: string;
          business_id?: string | null;
        };
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          summary: string;
          category_id: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          details: Record<string, unknown> | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          summary: string;
          category_id?: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone?: string | null;
          details?: Record<string, unknown> | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          summary?: string;
          category_id?: string | null;
          contact_name?: string;
          contact_email?: string;
          contact_phone?: string | null;
          details?: Record<string, unknown> | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      ads: {
        Row: {
          id: string;
          business_id: string;
          headline: string;
          body: string | null;
          cta_label: string | null;
          cta_url: string | null;
          category_id: string | null;
          active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          headline: string;
          body?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          category_id?: string | null;
          active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          headline?: string;
          body?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          category_id?: string | null;
          active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      flash_deals: {
        Row: {
          id: string;
          business_id: string;
          headline: string;
          description: string | null;
          category_id: string | null;
          deal_date: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          headline: string;
          description?: string | null;
          category_id?: string | null;
          deal_date: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          headline?: string;
          description?: string | null;
          category_id?: string | null;
          deal_date?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      flash_deal_upcoming: {
        // Vy (read-only) — exponerar bara företag + datum för kommande deals.
        Row: {
          id: string;
          business_id: string;
          deal_date: string;
        };
        Insert: { id?: string; business_id?: string; deal_date?: string };
        Update: { id?: string; business_id?: string; deal_date?: string };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          business_id: string;
          quote_request_id: string;
          reviewer_email: string;
          reviewer_name: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          quote_request_id: string;
          reviewer_email: string;
          reviewer_name: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          quote_request_id?: string;
          reviewer_email?: string;
          reviewer_name?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      seasonal_content: {
        Row: {
          week_key: string;
          season: string;
          hero_title: string;
          hero_subtitle: string;
          spotlight_title: string;
          spotlight_body: string;
          chat_greeting: string;
          generated_at: string;
        };
        Insert: {
          week_key: string;
          season: string;
          hero_title: string;
          hero_subtitle: string;
          spotlight_title: string;
          spotlight_body: string;
          chat_greeting: string;
          generated_at?: string;
        };
        Update: {
          week_key?: string;
          season?: string;
          hero_title?: string;
          hero_subtitle?: string;
          spotlight_title?: string;
          spotlight_body?: string;
          chat_greeting?: string;
          generated_at?: string;
        };
        Relationships: [];
      };
      quote_request_businesses: {
        Row: {
          quote_request_id: string;
          business_id: string;
          notified_at: string;
        };
        Insert: {
          quote_request_id: string;
          business_id: string;
          notified_at?: string;
        };
        Update: {
          quote_request_id?: string;
          business_id?: string;
          notified_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export function createBrowserClient() {
  return createSSRBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

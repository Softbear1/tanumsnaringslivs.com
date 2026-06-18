import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

export type Database = {
  public: {
    Tables: {
      claim_requests: {
        Row: {
          id: string;
          business_id: string;
          claimant_email: string;
          claimant_user_id: string | null;
          message: string | null;
          method: string;
          status: string;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          claimant_email: string;
          claimant_user_id?: string | null;
          message?: string | null;
          method?: string;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          claimant_email?: string;
          claimant_user_id?: string | null;
          message?: string | null;
          method?: string;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
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
          logo_url: string | null;
          scb_org_nr: string | null;
          claimed: boolean;
          claim_email: string | null;
          reklamsparr: boolean;
          source: string;
          postort: string | null;
          scb_synced_at: string | null;
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
          logo_url?: string | null;
          scb_org_nr?: string | null;
          claimed?: boolean;
          claim_email?: string | null;
          reklamsparr?: boolean;
          source?: string;
          postort?: string | null;
          scb_synced_at?: string | null;
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
          logo_url?: string | null;
          scb_org_nr?: string | null;
          claimed?: boolean;
          claim_email?: string | null;
          reklamsparr?: boolean;
          source?: string;
          postort?: string | null;
          scb_synced_at?: string | null;
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
      offer_clicks: {
        Row: {
          id: number;
          offer_id: string;
          business_id: string | null;
          kind: "ad" | "flash";
          clicked_at: string;
        };
        Insert: {
          id?: number;
          offer_id: string;
          business_id?: string | null;
          kind: "ad" | "flash";
          clicked_at?: string;
        };
        Update: {
          id?: number;
          offer_id?: string;
          business_id?: string | null;
          kind?: "ad" | "flash";
          clicked_at?: string;
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
          fb_post_id: string | null;
          post_to_fb: boolean;
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
          fb_post_id?: string | null;
          post_to_fb?: boolean;
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
          fb_post_id?: string | null;
          post_to_fb?: boolean;
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

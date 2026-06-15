export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; icon: string; color: string; bg_color: string; sort_order: number; };
        Insert: { id: string; name: string; icon: string; color: string; bg_color: string; sort_order?: number; };
        Update: { id?: string; name?: string; icon?: string; color?: string; bg_color?: string; sort_order?: number; };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string; name: string; category_id: string; description: string; phone: string;
          email: string; website: string | null; address: string; initials: string;
          boosted: boolean; featured: boolean; rating: number; review_count: number;
          active: boolean; created_at: string; owner_id: string | null;
        };
        Insert: {
          id?: string; name: string; category_id: string; description: string; phone: string;
          email: string; website?: string | null; address: string; initials: string;
          boosted?: boolean; featured?: boolean; rating?: number; review_count?: number;
          active?: boolean; owner_id?: string | null;
        };
        Update: {
          name?: string; category_id?: string; description?: string; phone?: string;
          email?: string; website?: string | null; address?: string; initials?: string;
          boosted?: boolean; featured?: boolean; rating?: number; review_count?: number;
          active?: boolean; owner_id?: string | null;
        };
        Relationships: [];
      };
      page_views: {
        Row: { id: number; viewed_at: string; };
        Insert: { id?: number; viewed_at?: string; };
        Update: { id?: number; viewed_at?: string; };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

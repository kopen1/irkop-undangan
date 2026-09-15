export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: "user" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "user" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "user" | "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          key: string;
          name: string;
          price: number;
          max_invitations: number;
          max_guests: number;
          max_photos: number;
          active_duration_days: number;
          theme_quota: number | null;
          features: Json;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          price?: number;
          max_invitations?: number;
          max_guests?: number;
          max_photos?: number;
          active_duration_days?: number;
          theme_quota?: number | null;
          features?: Json;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      themes: {
        Row: {
          id: string;
          key: string;
          name: string;
          preview_image: string | null;
          category: "basic" | "eksklusif" | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          preview_image?: string | null;
          category?: "basic" | "eksklusif" | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["themes"]["Insert"]>;
        Relationships: [];
      };
      plan_themes: {
        Row: { plan_id: string; theme_id: string };
        Insert: { plan_id: string; theme_id: string };
        Update: { plan_id?: string; theme_id?: string };
        Relationships: [];
      };
      reserved_slugs: {
        Row: { slug: string };
        Insert: { slug: string };
        Update: { slug?: string };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          plan_id: string;
          theme_id: string;
          status: "draft" | "published" | "expired" | "archived";
          groom_name: string | null;
          bride_name: string | null;
          event_date: string | null;
          cover_image: string | null;
          content: Json;
          storage_used_bytes: number;
          published_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          plan_id: string;
          theme_id: string;
          status?: "draft" | "published" | "expired" | "archived";
          groom_name?: string | null;
          bride_name?: string | null;
          event_date?: string | null;
          cover_image?: string | null;
          content?: Json;
          storage_used_bytes?: number;
          published_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitations"]["Insert"]>;
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          invitation_id: string;
          name: string;
          slug: string;
          whatsapp_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          name: string;
          slug: string;
          whatsapp_sent_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guests"]["Insert"]>;
        Relationships: [];
      };
      rsvp: {
        Row: {
          id: string;
          invitation_id: string;
          guest_id: string | null;
          attendance: "hadir" | "tidak_hadir" | "masih_ragu";
          guest_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_id?: string | null;
          attendance: "hadir" | "tidak_hadir" | "masih_ragu";
          guest_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rsvp"]["Insert"]>;
        Relationships: [];
      };
      wishes: {
        Row: {
          id: string;
          invitation_id: string;
          guest_name: string;
          message: string;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_name: string;
          message: string;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishes"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          invitation_id: string;
          plan_id: string;
          amount: number;
          payment_method: string;
          status: "pending" | "verified" | "rejected";
          proof_url: string | null;
          verified_by: string | null;
          created_at: string;
          verified_at: string | null;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          plan_id: string;
          amount?: number;
          payment_method?: string;
          status?: "pending" | "verified" | "rejected";
          proof_url?: string | null;
          verified_by?: string | null;
          created_at?: string;
          verified_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_guest_by_slug: {
        Args: { p_invitation_slug: string; p_guest_slug: string };
        Returns: Array<{ id: string; name: string }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

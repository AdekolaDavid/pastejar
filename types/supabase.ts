export type ClipType = 'text' | 'link' | 'image' | 'code';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          max_clips: number;
          default_expiry_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          max_clips?: number;
          default_expiry_hours?: number;
        };
        Update: {
          display_name?: string | null;
          max_clips?: number;
          default_expiry_hours?: number;
        };
      };
      clips: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          clip_type: ClipType;
          title: string | null;
          pinned: boolean;
          favorite: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          clip_type?: ClipType;
          title?: string | null;
          pinned?: boolean;
          favorite?: boolean;
          expires_at?: string | null;
        };
        Update: {
          content?: string;
          clip_type?: ClipType;
          title?: string | null;
          pinned?: boolean;
          favorite?: boolean;
          expires_at?: string | null;
        };
      };
      clip_metadata: {
        Row: {
          id: string;
          clip_id: string;
          og_title: string | null;
          og_description: string | null;
          og_image: string | null;
          og_site_name: string | null;
          favicon_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clip_id: string;
          og_title?: string | null;
          og_description?: string | null;
          og_image?: string | null;
          og_site_name?: string | null;
          favicon_url?: string | null;
        };
        Update: {
          og_title?: string | null;
          og_description?: string | null;
          og_image?: string | null;
          og_site_name?: string | null;
          favicon_url?: string | null;
        };
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Clip = Database['public']['Tables']['clips']['Row'];
export type ClipInsert = Database['public']['Tables']['clips']['Insert'];
export type ClipUpdate = Database['public']['Tables']['clips']['Update'];
export type ClipMetadata = Database['public']['Tables']['clip_metadata']['Row'];

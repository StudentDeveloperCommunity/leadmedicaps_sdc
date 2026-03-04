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
          email: string;
          name: string;
          username: string;
          batch: number;
          avatar_url: string | null;
          linkedin_url: string | null;
          leetcode_username: string | null;
          codeforces_username: string | null;
          codechef_username: string | null;
          cp_score: number;
          total_solved: number;
          leetcode_stats: Json | null;
          codeforces_stats: Json | null;
          codechef_stats: Json | null;
          setup_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          username?: string;
          batch?: number;
          avatar_url?: string | null;
          linkedin_url?: string | null;
          leetcode_username?: string | null;
          codeforces_username?: string | null;
          codechef_username?: string | null;
          cp_score?: number;
          total_solved?: number;
          leetcode_stats?: Json | null;
          codeforces_stats?: Json | null;
          codechef_stats?: Json | null;
          setup_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          username?: string;
          batch?: number;
          avatar_url?: string | null;
          linkedin_url?: string | null;
          leetcode_username?: string | null;
          codeforces_username?: string | null;
          codechef_username?: string | null;
          cp_score?: number;
          total_solved?: number;
          leetcode_stats?: Json | null;
          codeforces_stats?: Json | null;
          codechef_stats?: Json | null;
          setup_complete?: boolean;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

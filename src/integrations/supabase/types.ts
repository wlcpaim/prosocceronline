export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      gol_matches: {
        Row: {
          created_at: string
          id: string
          p1_name: string
          p1_overall: number
          p1_player_id: string
          p1_score: number
          p1_user_id: string
          p2_name: string | null
          p2_overall: number | null
          p2_player_id: string | null
          p2_score: number
          p2_user_id: string | null
          rounds: Json | null
          status: string
          updated_at: string
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          p1_name: string
          p1_overall: number
          p1_player_id: string
          p1_score?: number
          p1_user_id: string
          p2_name?: string | null
          p2_overall?: number | null
          p2_player_id?: string | null
          p2_score?: number
          p2_user_id?: string | null
          rounds?: Json | null
          status?: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          p1_name?: string
          p1_overall?: number
          p1_player_id?: string
          p1_score?: number
          p1_user_id?: string
          p2_name?: string | null
          p2_overall?: number | null
          p2_player_id?: string | null
          p2_score?: number
          p2_user_id?: string | null
          rounds?: Json | null
          status?: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          id: string
          item_id: string
          item_name: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_training: {
        Row: {
          avancado_key: string | null
          avancado_until: string | null
          basico_key: string | null
          basico_until: string | null
          boost_until: string | null
          created_at: string
          global_lock_until: string | null
          player_id: string
          profissional_key: string | null
          profissional_until: string | null
          skill_key: string | null
          skill_until: string | null
          updated_at: string
        }
        Insert: {
          avancado_key?: string | null
          avancado_until?: string | null
          basico_key?: string | null
          basico_until?: string | null
          boost_until?: string | null
          created_at?: string
          global_lock_until?: string | null
          player_id: string
          profissional_key?: string | null
          profissional_until?: string | null
          skill_key?: string | null
          skill_until?: string | null
          updated_at?: string
        }
        Update: {
          avancado_key?: string | null
          avancado_until?: string | null
          basico_key?: string | null
          basico_until?: string | null
          boost_until?: string | null
          created_at?: string
          global_lock_until?: string | null
          player_id?: string
          profissional_key?: string | null
          profissional_until?: string | null
          skill_key?: string | null
          skill_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_training_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          alt_positions: string[] | null
          attributes: Json
          created_at: string
          equipped_cleat: string | null
          height_cm: number
          id: string
          name: string
          nationality: string | null
          overall: number
          play_style: string | null
          position: string
          potential: number
          preferred_foot: string | null
          server_id: string | null
          skill_moves: number
          updated_at: string
          user_id: string
          weak_foot: number
          weight_kg: number
        }
        Insert: {
          age?: number
          alt_positions?: string[] | null
          attributes?: Json
          created_at?: string
          equipped_cleat?: string | null
          height_cm?: number
          id?: string
          name: string
          nationality?: string | null
          overall?: number
          play_style?: string | null
          position: string
          potential?: number
          preferred_foot?: string | null
          server_id?: string | null
          skill_moves?: number
          updated_at?: string
          user_id: string
          weak_foot?: number
          weight_kg?: number
        }
        Update: {
          age?: number
          alt_positions?: string[] | null
          attributes?: Json
          created_at?: string
          equipped_cleat?: string | null
          height_cm?: number
          id?: string
          name?: string
          nationality?: string | null
          overall?: number
          play_style?: string | null
          position?: string
          potential?: number
          preferred_foot?: string | null
          server_id?: string | null
          skill_moves?: number
          updated_at?: string
          user_id?: string
          weak_foot?: number
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_name: string
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          price: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      servers: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          region: string | null
          season: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          region?: string | null
          season: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          region?: string | null
          season?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_at: string | null
          amount_cents: number | null
          created_at: string
          external_id: string | null
          payer_email: string | null
          pix_code: string | null
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          amount_cents?: number | null
          created_at?: string
          external_id?: string | null
          payer_email?: string | null
          pix_code?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          amount_cents?: number | null
          created_at?: string
          external_id?: string | null
          payer_email?: string | null
          pix_code?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          claimed_at: string
          id: string
          mission_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          mission_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          coins: number
          created_at: string
          level: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          coins?: number
          created_at?: string
          level?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          coins?: number
          created_at?: string
          level?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_player_stats: {
        Args: never
        Returns: {
          online: number
          registered: number
        }[]
      }
      has_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_player_name_available: { Args: { _name: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

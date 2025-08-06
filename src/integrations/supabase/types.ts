export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      demandes_maintenance: {
        Row: {
          annee: number | null
          created_at: string | null
          email_client: string | null
          id: string | null
          kilometrage: number | null
          marque: string | null
          modele: string | null
          telephone_client: string | null
          type_maintenance: string | null
        }
        Insert: {
          annee?: number | null
          created_at?: string | null
          email_client?: string | null
          id?: string | null
          kilometrage?: number | null
          marque?: string | null
          modele?: string | null
          telephone_client?: string | null
          type_maintenance?: string | null
        }
        Update: {
          annee?: number | null
          created_at?: string | null
          email_client?: string | null
          id?: string | null
          kilometrage?: number | null
          marque?: string | null
          modele?: string | null
          telephone_client?: string | null
          type_maintenance?: string | null
        }
        Relationships: []
      }
      devis: {
        Row: {
          created_at: string | null
          email_client: string | null
          id: string
          nom_client: string | null
          service: string | null
          telephone_client: string | null
        }
        Insert: {
          created_at?: string | null
          email_client?: string | null
          id: string
          nom_client?: string | null
          service?: string | null
          telephone_client?: string | null
        }
        Update: {
          created_at?: string | null
          email_client?: string | null
          id?: string
          nom_client?: string | null
          service?: string | null
          telephone_client?: string | null
        }
        Relationships: []
      }
      feedback_clients: {
        Row: {
          commentaire: string | null
          created_at: string | null
          id: number
          nom: string | null
          note: number | null
          service: string | null
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          id?: number
          nom?: string | null
          note?: number | null
          service?: string | null
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          id?: number
          nom?: string | null
          note?: number | null
          service?: string | null
        }
        Relationships: []
      }
      rendez_vous: {
        Row: {
          cancelled: boolean | null
          cancelled_at: string | null
          cancelled_reason: string | null
          created_at: string | null
          date_rdv: string | null
          email_client: string | null
          heure_rdv: string | null
          id: number
          nom_client: string | null
          service: string | null
          status: string | null
          telephone_client: string | null
          user_id: string | null
          vehicule: string
        }
        Insert: {
          cancelled?: boolean | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          date_rdv?: string | null
          email_client?: string | null
          heure_rdv?: string | null
          id?: number
          nom_client?: string | null
          service?: string | null
          status?: string | null
          telephone_client?: string | null
          user_id?: string | null
          vehicule?: string
        }
        Update: {
          cancelled?: boolean | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          date_rdv?: string | null
          email_client?: string | null
          heure_rdv?: string | null
          id?: number
          nom_client?: string | null
          service?: string | null
          status?: string | null
          telephone_client?: string | null
          user_id?: string | null
          vehicule?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

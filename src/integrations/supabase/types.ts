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
      acordos: {
        Row: {
          cliente_id: string
          created_at: string
          data_acordo: string
          divida_id: string
          id: string
          proposta_id: string
          status: Database["public"]["Enums"]["acordo_status"]
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_acordo?: string
          divida_id: string
          id?: string
          proposta_id: string
          status?: Database["public"]["Enums"]["acordo_status"]
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_acordo?: string
          divida_id?: string
          id?: string
          proposta_id?: string
          status?: Database["public"]["Enums"]["acordo_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acordos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acordos_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acordos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      dividas: {
        Row: {
          cliente_id: string
          created_at: string
          data_vencimento: string
          empresa_id: string
          id: string
          juros: number
          numero: string
          status: Database["public"]["Enums"]["divida_status"]
          updated_at: string
          valor_original: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_vencimento: string
          empresa_id: string
          id?: string
          juros?: number
          numero: string
          status?: Database["public"]["Enums"]["divida_status"]
          updated_at?: string
          valor_original?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_vencimento?: string
          empresa_id?: string
          id?: string
          juros?: number
          numero?: string
          status?: Database["public"]["Enums"]["divida_status"]
          updated_at?: string
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          created_at: string
          email: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          acordo_id: string
          codigo_pagamento: string
          created_at: string
          data_pagamento: string
          id: string
          status: Database["public"]["Enums"]["pagamento_status"]
          tipo_pagamento: Database["public"]["Enums"]["tipo_pagamento"]
          updated_at: string
          valor: number
        }
        Insert: {
          acordo_id: string
          codigo_pagamento: string
          created_at?: string
          data_pagamento?: string
          id?: string
          status?: Database["public"]["Enums"]["pagamento_status"]
          tipo_pagamento: Database["public"]["Enums"]["tipo_pagamento"]
          updated_at?: string
          valor?: number
        }
        Update: {
          acordo_id?: string
          codigo_pagamento?: string
          created_at?: string
          data_pagamento?: string
          id?: string
          status?: Database["public"]["Enums"]["pagamento_status"]
          tipo_pagamento?: Database["public"]["Enums"]["tipo_pagamento"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_acordo_id_fkey"
            columns: ["acordo_id"]
            isOneToOne: false
            referencedRelation: "acordos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propostas: {
        Row: {
          created_at: string
          divida_id: string
          id: string
          percentual_desconto: number
          quantidade_parcelas: number
          validade: string
          valor_com_desconto: number
          valor_parcela: number
        }
        Insert: {
          created_at?: string
          divida_id: string
          id?: string
          percentual_desconto?: number
          quantidade_parcelas?: number
          validade: string
          valor_com_desconto?: number
          valor_parcela?: number
        }
        Update: {
          created_at?: string
          divida_id?: string
          id?: string
          percentual_desconto?: number
          quantidade_parcelas?: number
          validade?: string
          valor_com_desconto?: number
          valor_parcela?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      acordo_status: "Pendente" | "Ativo" | "Pago" | "Cancelado"
      app_role: "admin" | "cliente"
      divida_status: "Em Aberto" | "Em Negociação" | "Quitada"
      pagamento_status: "Pendente" | "Pago" | "Cancelado"
      tipo_pagamento: "Pix" | "Boleto"
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
      acordo_status: ["Pendente", "Ativo", "Pago", "Cancelado"],
      app_role: ["admin", "cliente"],
      divida_status: ["Em Aberto", "Em Negociação", "Quitada"],
      pagamento_status: ["Pendente", "Pago", "Cancelado"],
      tipo_pagamento: ["Pix", "Boleto"],
    },
  },
} as const

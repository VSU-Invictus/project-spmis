
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "approval_queue_items": {
                  Row: {
                    "created_at": string,"decided_at": string | null,"decided_by": string | null,"decision_reason": string | null,"id": string,"payload": NonNullable<Json>,"status": string,"submitted_by": string | null,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"decision_reason"?: string | null,"id"?: string,"payload": NonNullable<Json>,"status"?: string,"submitted_by"?: string | null,"type": string
                  }
                  Update: {
                    "created_at"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"decision_reason"?: string | null,"id"?: string,"payload"?: NonNullable<Json>,"status"?: string,"submitted_by"?: string | null,"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "approval_queue_items_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "approval_queue_items_submitted_by_fkey"
      columns: ["submitted_by"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log_entries": {
                  Row: {
                    "action": string,"actor_id": string | null,"actor_role": string,"created_at": string,"entity_id": string,"entity_type": string,"id": string,"metadata": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"actor_role": string,"created_at"?: string,"entity_id": string,"entity_type": string,"id"?: string,"metadata"?: Json | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"actor_role"?: string,"created_at"?: string,"entity_id"?: string,"entity_type"?: string,"id"?: string,"metadata"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_entries_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"departments": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"proposed_by": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"proposed_by"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"proposed_by"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "departments_proposed_by_fkey"
      columns: ["proposed_by"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"faculty_profiles": {
                  Row: {
                    "created_at": string,"department_id": string,"email": string,"full_name": string,"id": string,"role": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"department_id": string,"email": string,"full_name": string,"id": string,"role"?: string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"department_id"?: string,"email"?: string,"full_name"?: string,"id"?: string,"role"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "faculty_profiles_department_id_fkey"
      columns: ["department_id"]
isOneToOne: false
      referencedRelation: "departments"
      referencedColumns: ["id"]
    }
                  ]
                },"programs": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"proposed_by": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"proposed_by"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"proposed_by"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "programs_proposed_by_fkey"
      columns: ["proposed_by"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"review_attachments": {
                  Row: {
                    "created_at": string,"id": string,"mime_type": string,"review_id": string,"size_bytes": number,"storage_path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"mime_type": string,"review_id": string,"size_bytes": number,"storage_path": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"mime_type"?: string,"review_id"?: string,"size_bytes"?: number,"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_attachments_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "review_details"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_attachments_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    }
                  ]
                },"review_embeddings": {
                  Row: {
                    "embedding": string,"generated_at": string,"review_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "embedding": string,"generated_at"?: string,"review_id": string
                  }
                  Update: {
                    "embedding"?: string,"generated_at"?: string,"review_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_embeddings_review_id_fkey"
      columns: ["review_id"]
isOneToOne: true
      referencedRelation: "review_details"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_embeddings_review_id_fkey"
      columns: ["review_id"]
isOneToOne: true
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    }
                  ]
                },"review_tags": {
                  Row: {
                    "id": string,"review_id": string,"tag": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"review_id": string,"tag": string
                  }
                  Update: {
                    "id"?: string,"review_id"?: string,"tag"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_tags_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "review_details"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_tags_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_tags_tag_fkey"
      columns: ["tag"]
isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["tag"]
    }
                  ]
                },"review_versions": {
                  Row: {
                    "body_document_snapshot": NonNullable<Json>,"body_text_snapshot": string,"edited_at": string,"edited_by": string,"id": string,"review_id": string,"tags_snapshot": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                    "body_document_snapshot": NonNullable<Json>,"body_text_snapshot": string,"edited_at"?: string,"edited_by": string,"id"?: string,"review_id": string,"tags_snapshot"?: (string)[]
                  }
                  Update: {
                    "body_document_snapshot"?: NonNullable<Json>,"body_text_snapshot"?: string,"edited_at"?: string,"edited_by"?: string,"id"?: string,"review_id"?: string,"tags_snapshot"?: (string)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_versions_edited_by_fkey"
      columns: ["edited_by"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_versions_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "review_details"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_versions_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "body_document": NonNullable<Json>,"body_text": string,"created_at": string,"deidentified_text": string,"id": string,"owner_id": string,"status": string,"student_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_document": NonNullable<Json>,"body_text": string,"created_at"?: string,"deidentified_text": string,"id"?: string,"owner_id": string,"status"?: string,"student_id": string,"updated_at"?: string
                  }
                  Update: {
                    "body_document"?: NonNullable<Json>,"body_text"?: string,"created_at"?: string,"deidentified_text"?: string,"id"?: string,"owner_id"?: string,"status"?: string,"student_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "student_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"student_profiles": {
                  Row: {
                    "created_at": string,"first_name": string,"id": string,"last_name": string,"middle_name": string | null,"program_id": string,"registration_source": string,"student_id_number": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"first_name": string,"id"?: string,"last_name": string,"middle_name"?: string | null,"program_id": string,"registration_source"?: string,"student_id_number": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"first_name"?: string,"id"?: string,"last_name"?: string,"middle_name"?: string | null,"program_id"?: string,"registration_source"?: string,"student_id_number"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "student_profiles_program_id_fkey"
      columns: ["program_id"]
isOneToOne: false
      referencedRelation: "programs"
      referencedColumns: ["id"]
    }
                  ]
                },"tags": {
                  Row: {
                    "tag": string
                  }
                  ComputedFields: never
                  Insert: {
                    "tag": string
                  }
                  Update: {
                    "tag"?: string
                  }
                  Relationships: [

                  ]
                }
          }
          Views: {
            "review_details": {
                  Row: {
                    "attachments": Json | null,"author_department_name": string | null,"author_name": string | null,"body_document": NonNullable<Json>,"body_text": string,"created_at": string,"id": string,"owner_id": string,"status": string,"student_id": string,"tags": (string)[] | null,"updated_at": string
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "reviews_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_student_id_fkey"
      columns: ["student_id"]
isOneToOne: false
      referencedRelation: "student_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"review_revisions": {
                  Row: {
                    "body_document_snapshot": NonNullable<Json>,"body_text_snapshot": string,"edited_at": string,"edited_by": string,"id": string,"review_id": string,"tags_snapshot": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                           "body_document_snapshot"?: Json | null,"body_text_snapshot"?: string | null,"edited_at"?: string | null,"edited_by"?: string | null,"id"?: string | null,"review_id"?: string | null,"tags_snapshot"?: (string)[] | null
                         }
                        Update: {
                           "body_document_snapshot"?: Json | null,"body_text_snapshot"?: string | null,"edited_at"?: string | null,"edited_by"?: string | null,"id"?: string | null,"review_id"?: string | null,"tags_snapshot"?: (string)[] | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "review_versions_edited_by_fkey"
      columns: ["edited_by"]
isOneToOne: false
      referencedRelation: "faculty_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_versions_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "review_details"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_versions_review_id_fkey"
      columns: ["review_id"]
isOneToOne: false
      referencedRelation: "reviews"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "get_own_profile":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"get_student_by_id":
{ Args: { "p_student_id": string }; Returns: Json
                           },
"search_students":
{ Args: { "owner_department_id"?: string,"owner_id"?: string,"program_id"?: string,"query"?: string,"tag"?: string }; Returns: Database["public"]['CompositeTypes']["student_search_result"][]
                          SetofOptions: {
        from: "*"
        to: "student_search_result"
        isOneToOne: false
        isSetofReturn: true
      } },
"suggest_review_tags":
{ Args: { "prefix"?: string }; Returns: {
              "tag": string
            }[]
                           },
"update_own_profile":
{ Args: { "full_name": string }; Returns: {
              "created_at": string,
"department_id": string,
"email": string,
"full_name": string,
"id": string,
"role": string,
"status": string,
"updated_at": string
            }[]
                          SetofOptions: {
        from: "*"
        to: "faculty_profiles"
        isOneToOne: false
        isSetofReturn: true
      } }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            "student_search_result": {
                        "id": string | null,"student_id_number": string | null,"first_name": string | null,"last_name": string | null,"middle_name": string | null,"program_id": string | null,"registration_source": string | null,"created_at": string | null,"updated_at": string | null,"program_name": string | null,"visible_review_tags": (string)[] | null
                      }
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {

          }
        },"public": {
          Enums: {

          }
        }
} as const

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      ai_action_logs: {
        Row: {
          action_data: Json;
          action_type: string;
          approved_at: string;
          created_at: string;
          id: string;
          source_input: string;
          undone_at: string | null;
          user_id: string;
        };
        Insert: {
          action_data: Json;
          action_type: string;
          approved_at?: string;
          created_at?: string;
          id?: string;
          source_input: string;
          undone_at?: string | null;
          user_id: string;
        };
        Update: {
          action_data?: Json;
          action_type?: string;
          approved_at?: string;
          created_at?: string;
          id?: string;
          source_input?: string;
          undone_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_settings: {
        Row: {
          ai_enabled: boolean;
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_enabled?: boolean;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_enabled?: boolean;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      captures: {
        Row: {
          content: string;
          created_at: string;
          date: string;
          id: string;
          source: string;
          source_id: string | null;
          tags: string[] | null;
          topic_ids: string[] | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          date: string;
          id?: string;
          source?: string;
          source_id?: string | null;
          tags?: string[] | null;
          topic_ids?: string[] | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          date?: string;
          id?: string;
          source?: string;
          source_id?: string | null;
          tags?: string[] | null;
          topic_ids?: string[] | null;
          user_id?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          content: string;
          created_at: string;
          date: string;
          id: string;
          mood_score: number | null;
          tags: string[] | null;
          timestamp: string;
          topic_ids: string[] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          date: string;
          id?: string;
          mood_score?: number | null;
          tags?: string[] | null;
          timestamp?: string;
          topic_ids?: string[] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          date?: string;
          id?: string;
          mood_score?: number | null;
          tags?: string[] | null;
          timestamp?: string;
          topic_ids?: string[] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          attendees: string[] | null;
          created_at: string;
          description: string | null;
          end_time: string;
          id: string;
          is_external: boolean;
          location: string | null;
          source: string | null;
          start_time: string;
          title: string;
          user_id: string;
        };
        Insert: {
          attendees?: string[] | null;
          created_at?: string;
          description?: string | null;
          end_time: string;
          id?: string;
          is_external?: boolean;
          location?: string | null;
          source?: string | null;
          start_time: string;
          title: string;
          user_id: string;
        };
        Update: {
          attendees?: string[] | null;
          created_at?: string;
          description?: string | null;
          end_time?: string;
          id?: string;
          is_external?: boolean;
          location?: string | null;
          source?: string | null;
          start_time?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          color: string | null;
          created_at: string;
          description: string | null;
          end_date: string | null;
          icon: string | null;
          id: string;
          name: string;
          start_date: string | null;
          status: string;
          topic_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          start_date?: string | null;
          status?: string;
          topic_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          start_date?: string | null;
          status?: string;
          topic_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'topics';
            referencedColumns: ['id'];
          },
        ];
      };
      project_notes: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          project_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: string;
          created_at?: string;
          id?: string;
          project_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_notes_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      routine_completions: {
        Row: {
          completed_at: string;
          count: number | null;
          date: string;
          id: string;
          routine_id: string;
          skipped: boolean;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          count?: number | null;
          date: string;
          id?: string;
          routine_id: string;
          skipped?: boolean;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          count?: number | null;
          date?: string;
          id?: string;
          routine_id?: string;
          skipped?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routine_completions_routine_id_fkey';
            columns: ['routine_id'];
            isOneToOne: false;
            referencedRelation: 'routines';
            referencedColumns: ['id'];
          },
        ];
      };
      routine_groups: {
        Row: {
          color: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          order: number;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          order?: number;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          order?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      routines: {
        Row: {
          best_streak: number;
          color: string | null;
          created_at: string;
          current_streak: number;
          group_id: string | null;
          icon: string | null;
          id: string;
          is_archived: boolean;
          name: string;
          order: number;
          schedule: Json;
          strength: number;
          target_count: number | null;
          time_block: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          best_streak?: number;
          color?: string | null;
          created_at?: string;
          current_streak?: number;
          group_id?: string | null;
          icon?: string | null;
          id?: string;
          is_archived?: boolean;
          name: string;
          order?: number;
          schedule?: Json;
          strength?: number;
          target_count?: number | null;
          time_block?: string;
          type?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          best_streak?: number;
          color?: string | null;
          created_at?: string;
          current_streak?: number;
          group_id?: string | null;
          icon?: string | null;
          id?: string;
          is_archived?: boolean;
          name?: string;
          order?: number;
          schedule?: Json;
          strength?: number;
          target_count?: number | null;
          time_block?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routines_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'routine_groups';
            referencedColumns: ['id'];
          },
        ];
      };
      subtasks: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          id: string;
          tags: string[] | null;
          task_id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          task_id: string;
          title: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          task_id?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subtasks_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          completed_at: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: string;
          project_id: string | null;
          recurrence_rule: Json | null;
          source_link: string | null;
          start_date: string | null;
          status: string;
          tags: string[] | null;
          title: string;
          topic_ids: string[] | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string;
          project_id?: string | null;
          recurrence_rule?: Json | null;
          source_link?: string | null;
          start_date?: string | null;
          status?: string;
          tags?: string[] | null;
          title: string;
          topic_ids?: string[] | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string;
          project_id?: string | null;
          recurrence_rule?: Json | null;
          source_link?: string | null;
          start_date?: string | null;
          status?: string;
          tags?: string[] | null;
          title?: string;
          topic_ids?: string[] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      topic_pages: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          topic_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          topic_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          topic_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'topic_pages_topic_id_fkey';
            columns: ['topic_id'];
            isOneToOne: false;
            referencedRelation: 'topics';
            referencedColumns: ['id'];
          },
        ];
      };
      topics: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'topics_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'topics';
            referencedColumns: ['id'];
          },
        ];
      };
      widget_settings: {
        Row: {
          created_at: string;
          id: string;
          settings: Json;
          updated_at: string;
          user_id: string;
          widget_key: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          settings?: Json;
          updated_at?: string;
          user_id: string;
          widget_key: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          settings?: Json;
          updated_at?: string;
          user_id?: string;
          widget_key?: string;
        };
        Relationships: [];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

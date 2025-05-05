export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          device_id: string | null
          id: string
          is_read: boolean
          message: string
          severity: Database["public"]["Enums"]["alert_severity"]
          timestamp: string
          title: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          device_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          severity: Database["public"]["Enums"]["alert_severity"]
          timestamp?: string
          title: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          device_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          timestamp?: string
          title?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action: Json
          condition: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
          zone_id: string
        }
        Insert: {
          action: Json
          condition: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
          zone_id: string
        }
        Update: {
          action?: Json
          condition?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string
          estimated_yield: number | null
          growth_days: number | null
          growth_stage: Database["public"]["Enums"]["growth_stage"]
          harvest_date: string | null
          id: string
          ideal_moisture: Json
          ideal_temperature: Json
          image_url: string | null
          name: string
          notes: string | null
          plant_spacing: number | null
          planting_date: string
          seed_source: string | null
          updated_at: string
          user_id: string
          variety: string | null
          zone_id: string
        }
        Insert: {
          created_at?: string
          estimated_yield?: number | null
          growth_days?: number | null
          growth_stage?: Database["public"]["Enums"]["growth_stage"]
          harvest_date?: string | null
          id?: string
          ideal_moisture?: Json
          ideal_temperature?: Json
          image_url?: string | null
          name: string
          notes?: string | null
          plant_spacing?: number | null
          planting_date: string
          seed_source?: string | null
          updated_at?: string
          user_id: string
          variety?: string | null
          zone_id: string
        }
        Update: {
          created_at?: string
          estimated_yield?: number | null
          growth_days?: number | null
          growth_stage?: Database["public"]["Enums"]["growth_stage"]
          harvest_date?: string | null
          id?: string
          ideal_moisture?: Json
          ideal_temperature?: Json
          image_url?: string | null
          name?: string
          notes?: string | null
          plant_spacing?: number | null
          planting_date?: string
          seed_source?: string | null
          updated_at?: string
          user_id?: string
          variety?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crops_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      device_api_keys: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      device_links: {
        Row: {
          created_at: string
          device_name: string
          expires_at: string
          id: string
          is_claimed: boolean
          link_code: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name: string
          expires_at: string
          id?: string
          is_claimed?: boolean
          link_code: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string
          expires_at?: string
          id?: string
          is_claimed?: boolean
          link_code?: string
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          battery_level: number | null
          created_at: string
          id: string
          last_reading: number | null
          last_updated: string
          location: Json
          name: string
          status: Database["public"]["Enums"]["device_status"]
          type: Database["public"]["Enums"]["device_type"]
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          id?: string
          last_reading?: number | null
          last_updated?: string
          location: Json
          name: string
          status?: Database["public"]["Enums"]["device_status"]
          type: Database["public"]["Enums"]["device_type"]
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          id?: string
          last_reading?: number | null
          last_updated?: string
          location?: Json
          name?: string
          status?: Database["public"]["Enums"]["device_status"]
          type?: Database["public"]["Enums"]["device_type"]
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      mqtt_config: {
        Row: {
          created_at: string
          id: string
          mqtt_enabled: boolean
          mqtt_password: string
          mqtt_username: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mqtt_enabled?: boolean
          mqtt_password: string
          mqtt_username: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mqtt_enabled?: boolean
          mqtt_password?: string
          mqtt_username?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          device_id: string
          id: string
          timestamp: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          device_id: string
          id?: string
          timestamp?: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          device_id?: string
          id?: string
          timestamp?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          description: string | null
          features: Json
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          phone_number: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          phone_number?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          phone_number?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_forecasts: {
        Row: {
          condition: Database["public"]["Enums"]["weather_condition"]
          created_at: string
          date: string
          humidity: number
          id: string
          precipitation: Json
          temperature: Json
          user_id: string
          wind_speed: number
        }
        Insert: {
          condition: Database["public"]["Enums"]["weather_condition"]
          created_at?: string
          date: string
          humidity: number
          id?: string
          precipitation: Json
          temperature: Json
          user_id: string
          wind_speed: number
        }
        Update: {
          condition?: Database["public"]["Enums"]["weather_condition"]
          created_at?: string
          date?: string
          humidity?: number
          id?: string
          precipitation?: Json
          temperature?: Json
          user_id?: string
          wind_speed?: number
        }
        Relationships: [
          {
            foreignKeyName: "weather_forecasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          area_size: number
          boundary_coordinates: Json
          created_at: string
          crop_type: string | null
          description: string | null
          id: string
          irrigation_method: string | null
          irrigation_status: Database["public"]["Enums"]["irrigation_status"]
          name: string
          notes: string | null
          soil_moisture_threshold: number | null
          soil_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_size: number
          boundary_coordinates?: Json
          created_at?: string
          crop_type?: string | null
          description?: string | null
          id?: string
          irrigation_method?: string | null
          irrigation_status?: Database["public"]["Enums"]["irrigation_status"]
          name: string
          notes?: string | null
          soil_moisture_threshold?: number | null
          soil_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_size?: number
          boundary_coordinates?: Json
          created_at?: string
          crop_type?: string | null
          description?: string | null
          id?: string
          irrigation_method?: string | null
          irrigation_status?: Database["public"]["Enums"]["irrigation_status"]
          name?: string
          notes?: string | null
          soil_moisture_threshold?: number | null
          soil_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_by_id: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_by_id: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_or_super: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin_or_super: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      action_type: "toggle_device" | "set_value" | "send_notification"
      alert_severity: "info" | "warning" | "error" | "critical"
      comparison_operator:
        | "less_than"
        | "greater_than"
        | "equal_to"
        | "not_equal_to"
      condition_type: "sensor_reading" | "time_based" | "weather_forecast"
      device_status: "online" | "offline" | "maintenance" | "alert"
      device_type:
        | "moisture_sensor"
        | "temperature_sensor"
        | "valve"
        | "pump"
        | "weather_station"
        | "ph_sensor"
        | "light_sensor"
      growth_stage:
        | "planting"
        | "germination"
        | "vegetative"
        | "flowering"
        | "fruiting"
        | "harvest"
      irrigation_status: "inactive" | "active" | "scheduled" | "paused"
      user_role: "super_admin" | "admin" | "farmer"
      weather_condition:
        | "sunny"
        | "cloudy"
        | "rainy"
        | "stormy"
        | "snowy"
        | "foggy"
        | "partly_cloudy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: ["toggle_device", "set_value", "send_notification"],
      alert_severity: ["info", "warning", "error", "critical"],
      comparison_operator: [
        "less_than",
        "greater_than",
        "equal_to",
        "not_equal_to",
      ],
      condition_type: ["sensor_reading", "time_based", "weather_forecast"],
      device_status: ["online", "offline", "maintenance", "alert"],
      device_type: [
        "moisture_sensor",
        "temperature_sensor",
        "valve",
        "pump",
        "weather_station",
        "ph_sensor",
        "light_sensor",
      ],
      growth_stage: [
        "planting",
        "germination",
        "vegetative",
        "flowering",
        "fruiting",
        "harvest",
      ],
      irrigation_status: ["inactive", "active", "scheduled", "paused"],
      user_role: ["super_admin", "admin", "farmer"],
      weather_condition: [
        "sunny",
        "cloudy",
        "rainy",
        "stormy",
        "snowy",
        "foggy",
        "partly_cloudy",
      ],
    },
  },
} as const

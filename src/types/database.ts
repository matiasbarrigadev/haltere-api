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
      bonus_packages: {
        Row: {
          bonus_amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          bonus_amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          bonus_amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          bonos_charged: number | null
          booking_number: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          currency: string | null
          end_datetime: string
          feedback: string | null
          fiat_charged: number | null
          id: string
          internal_notes: string | null
          location_id: string
          notes: string | null
          payment_method: string
          professional_id: string | null
          rating: number | null
          refund_bonos: number | null
          refund_fiat: number | null
          service_id: string
          source: string | null
          start_datetime: string
          status: string | null
          stripe_payment_id: string | null
          stripe_payment_status: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          user_type: string
          zone_id: string
        }
        Insert: {
          bonos_charged?: number | null
          booking_number: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          currency?: string | null
          end_datetime: string
          feedback?: string | null
          fiat_charged?: number | null
          id?: string
          internal_notes?: string | null
          location_id: string
          notes?: string | null
          payment_method: string
          professional_id?: string | null
          rating?: number | null
          refund_bonos?: number | null
          refund_fiat?: number | null
          service_id: string
          source?: string | null
          start_datetime: string
          status?: string | null
          stripe_payment_id?: string | null
          stripe_payment_status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          user_type: string
          zone_id: string
        }
        Update: {
          bonos_charged?: number | null
          booking_number?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          currency?: string | null
          end_datetime?: string
          feedback?: string | null
          fiat_charged?: number | null
          id?: string
          internal_notes?: string | null
          location_id?: string
          notes?: string | null
          payment_method?: string
          professional_id?: string | null
          rating?: number | null
          refund_bonos?: number | null
          refund_fiat?: number | null
          service_id?: string
          source?: string | null
          start_datetime?: string
          status?: string | null
          stripe_payment_id?: string | null
          stripe_payment_status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
          zone_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string
          amenities: string[] | null
          city: string
          closing_time: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_24_hours: boolean | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_time: string | null
          phone: string | null
          slug: string
          sort_order: number | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          city: string
          closing_time?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_24_hours?: boolean | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_time?: string | null
          phone?: string | null
          slug: string
          sort_order?: number | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          city?: string
          closing_time?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_24_hours?: boolean | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_time?: string | null
          phone?: string | null
          slug?: string
          sort_order?: number | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          buffer_minutes: number | null
          cancellation_hours: number | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_minutes: number
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          max_advance_days: number | null
          max_participants: number | null
          members_only: boolean | null
          min_advance_hours: number | null
          name: string
          price_bonos: number
          price_fiat: number
          requires_professional: boolean | null
          service_type: string
          slug: string
          sort_order: number | null
          specialty_required: string | null
          updated_at: string | null
        }
        Insert: {
          buffer_minutes?: number | null
          cancellation_hours?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_advance_days?: number | null
          max_participants?: number | null
          members_only?: boolean | null
          min_advance_hours?: number | null
          name: string
          price_bonos: number
          price_fiat: number
          requires_professional?: boolean | null
          service_type: string
          slug: string
          sort_order?: number | null
          specialty_required?: string | null
          updated_at?: string | null
        }
        Update: {
          buffer_minutes?: number | null
          cancellation_hours?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          max_advance_days?: number | null
          max_participants?: number | null
          members_only?: boolean | null
          min_advance_hours?: number | null
          name?: string
          price_bonos?: number
          price_fiat?: number
          requires_professional?: boolean | null
          service_type?: string
          slug?: string
          sort_order?: number | null
          specialty_required?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          application_date: string | null
          application_notes: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          member_status: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          application_date?: string | null
          application_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          member_status?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          application_date?: string | null
          application_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          member_status?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          bonus_balance: number | null
          created_at: string | null
          id: string
          lifetime_purchased: number | null
          lifetime_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_balance?: number | null
          created_at?: string | null
          id?: string
          lifetime_purchased?: number | null
          lifetime_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_balance?: number | null
          created_at?: string | null
          id?: string
          lifetime_purchased?: number | null
          lifetime_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string | null
          description: string | null
          floor_area_sqm: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
          zone_type: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          floor_area_sqm?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_id: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          zone_type: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          floor_area_sqm?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          zone_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      services_full: {
        Row: {
          available_zones: Json | null
          category_name: string | null
          category_slug: string | null
          id: string | null
          name: string | null
          price_bonos: number | null
          price_fiat: number | null
          service_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancel_booking: {
        Args: {
          p_booking_id: string
          p_cancelled_by: string
          p_reason?: string
          p_refund_bonos?: boolean
        }
        Returns: Database['public']['Tables']['bookings']['Row']
      }
      check_professional_availability: {
        Args: {
          p_professional_id: string
          p_start: string
          p_end: string
          p_exclude_booking_id?: string
        }
        Returns: { is_available: boolean; conflict_reason: string }[]
      }
      check_zone_availability: {
        Args: {
          p_zone_id: string
          p_start: string
          p_end: string
          p_exclude_booking_id?: string
        }
        Returns: { is_available: boolean; current_bookings: number; max_capacity: number }[]
      }
      complete_booking: {
        Args: { p_booking_id: string; p_completed_by: string }
        Returns: Database['public']['Tables']['bookings']['Row']
      }
      consume_bonos: {
        Args: {
          p_user_id: string
          p_amount: number
          p_reference_type: string
          p_reference_id: string
          p_description?: string
        }
        Returns: { wallet_id: string; new_balance: number; transaction_id: string }[]
      }
      create_booking_with_bonos: {
        Args: {
          p_user_id: string
          p_service_id: string
          p_zone_id: string
          p_location_id: string
          p_professional_id: string
          p_start_datetime: string
          p_end_datetime: string
          p_bonos_to_charge: number
          p_notes?: string
        }
        Returns: Database['public']['Tables']['bookings']['Row']
      }
      ensure_wallet_exists: { Args: { p_user_id: string }; Returns: string }
      purchase_bonos: {
        Args: {
          p_user_id: string
          p_package_id: string
          p_stripe_payment_id?: string
        }
        Returns: { wallet_id: string; new_balance: number; transaction_id: string }[]
      }
      refund_bonos: {
        Args: {
          p_user_id: string
          p_amount: number
          p_reference_type: string
          p_reference_id: string
          p_description?: string
        }
        Returns: { wallet_id: string; new_balance: number; transaction_id: string }[]
      }
    }
    Enums: {}
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenient type aliases
export type UserProfile = Tables<'user_profiles'>
export type Location = Tables<'locations'>
export type Zone = Tables<'zones'>
export type Service = Tables<'services'>
export type Booking = Tables<'bookings'>
export type Wallet = Tables<'wallets'>
export type BonusPackage = Tables<'bonus_packages'>
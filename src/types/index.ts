export * from './property'
export * from './user'
export * from './notification'
export * from './chat'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          email_verified_at: string | null
          full_name: string
          phone: string | null
          role: 'buyer' | 'seller' | 'agent' | 'admin'
          status: 'pending' | 'active' | 'suspended'
          is_verified: boolean
          is_suspended: boolean
          avatar_url: string | null
          locale: string
          timezone: string
          marketing_opt_in: boolean
          budget_min: number | null
          budget_max: number | null
          preferred_lgas: string[] | null
          preferred_property_types: string[] | null
          preferred_transaction_type: 'rent' | 'sale' | 'any' | null
          search_count: number
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string
          full_name: string
          email: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      listings: {
        Row: {
          id: string
          owner_id: string
          seller_id?: string
          title: string
          property_type: 'detached' | 'semi-detached' | 'flat' | 'terrace' | 'bungalow' | 'duplex' | 'land' | 'commercial'
          transaction_type: 'rent' | 'sale'
          lga: 'AMAC' | 'Bwari' | 'Gwagwalada' | 'Kuje' | 'Kwali' | 'Abaji'
          location: string
          address: string | null
          market_tier: 'Premium' | 'Prime' | 'Mid' | 'Emerging' | 'Outer' | 'Rural' | null
          bedrooms: number
          bathrooms: number
          land_size_sqm: number | null
          asking_price: number
          ai_price_estimate: number | null
          ai_price_min: number | null
          ai_price_max: number | null
          price_confidence: 'high' | 'medium' | 'low' | null
          predicted_price_min: number | null
          predicted_price_max: number | null
          predicted_confidence: 'high' | 'medium' | 'low' | null
          description: string | null
          title_type: string | null
          amenities: string[] | null
          images: string[] | null
          status: 'pending' | 'active' | 'rejected' | 'paused' | 'sold'
          fraud_score: number
          fraud_risk_level: 'low' | 'medium' | 'high' | 'critical'
          fraud_red_flags: string[] | null
          fraud_recommendation: string | null
          last_valued_at: string | null
          last_scored_at: string | null
          views: number
          saves: number
          enquiries: number
          data_source: string
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['listings']['Row']> & {
          owner_id: string
          title: string
          asking_price: number
        }
        Update: Partial<Database['public']['Tables']['listings']['Row']>
      }
    }
  }
}

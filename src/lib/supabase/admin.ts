import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

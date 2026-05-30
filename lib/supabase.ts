import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
)

let _serviceClient: SupabaseClient | null = null

function createClientOrThrow(): SupabaseClient {
  if (!isConfigured) {
    throw new Error('Database not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

export function createServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClientOrThrow()
  }
  return _serviceClient
}

export function getClient(): SupabaseClient {
  return createClientOrThrow()
}
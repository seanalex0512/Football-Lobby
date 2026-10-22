import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _service: SupabaseClient | null = null
let _public: SupabaseClient | null = null

export function getServiceSupabase() {
  if (!_service) {
    _service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _service
}

export function getPublicSupabase() {
  if (!_public) {
    _public = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _public
}

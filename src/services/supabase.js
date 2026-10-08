import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && key)
export const supabase = supabaseConfigured ? createClient(url, key) : null

export async function testSupabaseConnection() {
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const { error } = await supabase.from('medicines').select('id').limit(1)
  return { ok: !error, error }
}

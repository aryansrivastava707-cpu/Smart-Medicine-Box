import { supabase, supabaseConfigured } from './supabase'

export const dataMode = supabaseConfigured ? 'supabase' : 'demo'

export async function fetchTable(table) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data ?? []
}

export async function insertRow(table, row) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) throw error
  return data
}

export async function updateRow(table, id, row) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRow(table, id) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function recordDeviceEvent(event) {
  if (!supabase) return { demo: true, event }
  return insertRow('device_events', event)
}

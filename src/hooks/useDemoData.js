import { useCallback, useEffect, useMemo, useState } from 'react'
import { demoCompartments, demoDevice, demoLogs, demoMedicines, demoNotifications, demoProfile, demoSchedules } from '../data/demoData'
import { supabase } from '../services/supabase'
import { getWeekdayShort, localDateKey, uid } from '../utils/helpers'

const STORAGE_VERSION = '3'

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function sameDemoSession() {
  return localStorage.getItem('smb_demo_date') === localDateKey() && localStorage.getItem('smb_demo_version') === STORAGE_VERSION
}

function initialState(key, fallback) {
  return sameDemoSession() ? readStored(key, fallback) : fallback
}

const emptyDevice = (userId) => ({
  id: null,
  name: 'Smart Medical Box',
  device_id: `SMB-${userId ? userId.slice(0, 6).toUpperCase() : '001'}`,
  connection: 'Offline',
  wifi: 'Disconnected',
  last_sync: null,
  firmware: 'v1.0.0',
  battery: null,
  temperature: null,
  humidity: null,
  demo: false
})

export function useDemoData(forceDemo = false, authUser = null) {
  const [loading, setLoading] = useState(!forceDemo && Boolean(authUser))
  const [error, setError] = useState('')
  const [medicines, setMedicines] = useState(() => forceDemo ? initialState('smb_medicines', demoMedicines) : [])
  const [schedules, setSchedules] = useState(() => forceDemo ? initialState('smb_schedules', demoSchedules) : [])
  const [logs, setLogs] = useState(() => forceDemo ? initialState('smb_logs', demoLogs) : [])
  const [notifications, setNotifications] = useState(() => forceDemo ? initialState('smb_notifications', demoNotifications) : [])
  const [compartmentRows, setCompartmentRows] = useState([])
  const [device, setDevice] = useState(() => forceDemo ? initialState('smb_device', demoDevice) : emptyDevice(authUser?.id))
  const [profile, setProfileState] = useState(() => forceDemo ? initialState('smb_profile', demoProfile) : {
    name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || ''
  })

  const isDemo = forceDemo

  const loadUserData = useCallback(async () => {
    if (forceDemo || !authUser || !supabase) return
    setLoading(true)
    setError('')
    try {
      const userId = authUser.id
      const [profileRes, medicinesRes, schedulesRes, logsRes, notificationsRes, deviceRes, compartmentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('medicines').select('*').order('created_at', { ascending: true }),
        supabase.from('medicine_schedules').select('*').order('time', { ascending: true }),
        supabase.from('medicine_logs').select('*').order('scheduled_date', { ascending: false }).order('scheduled_time', { ascending: true }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('device_status').select('*').limit(1).maybeSingle(),
        supabase.from('compartments').select('*').order('number', { ascending: true })
      ])
      const firstError = [profileRes, medicinesRes, schedulesRes, logsRes, notificationsRes, deviceRes, compartmentsRes].find(r => r.error)?.error
      if (firstError) throw firstError

      const authName = authUser.user_metadata?.full_name?.trim() || authUser.email?.split('@')[0] || 'User'
      const dbProfile = profileRes.data
      setProfileState({
        name: dbProfile?.name || authName,
        email: dbProfile?.email || authUser.email || ''
      })
      setMedicines(medicinesRes.data || [])
      setSchedules((schedulesRes.data || []).map(s => ({ ...s, time: String(s.time).slice(0, 5), compartment: Number(s.compartment) })))
      setLogs((logsRes.data || []).map(l => ({ ...l, scheduled_time: String(l.scheduled_time).slice(0, 5), compartment: Number(l.compartment) })))
      setNotifications(notificationsRes.data || [])
      setDevice(deviceRes.data ? { ...deviceRes.data, demo: false } : emptyDevice(userId))
      setCompartmentRows(compartmentsRes.data || [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load your account data.')
    } finally {
      setLoading(false)
    }
  }, [authUser, forceDemo])

  useEffect(() => {
    if (forceDemo) {
      // Switching from an authenticated account to Demo Mode must reset every
      // account-derived state. Otherwise React keeps the previous user's
      // profile/device/data until a full page reload.
      setMedicines(initialState('smb_medicines', demoMedicines))
      setSchedules(initialState('smb_schedules', demoSchedules))
      setLogs(initialState('smb_logs', demoLogs))
      setNotifications(initialState('smb_notifications', demoNotifications))
      setDevice(initialState('smb_device', demoDevice))
      setProfileState({ ...demoProfile })
      setCompartmentRows([])
      setError('')
      localStorage.setItem('smb_demo_date', localDateKey())
      localStorage.setItem('smb_demo_version', STORAGE_VERSION)
      setLoading(false)
      return
    }
    if (!authUser) {
      setMedicines([])
      setSchedules([])
      setLogs([])
      setNotifications([])
      setCompartmentRows([])
      setDevice(emptyDevice())
      setProfileState({ name: 'User', email: '' })
      setLoading(false)
      return
    }
    loadUserData()
  }, [forceDemo, authUser, loadUserData])

  useEffect(() => {
    if (!forceDemo) return
    localStorage.setItem('smb_medicines', JSON.stringify(medicines))
  }, [forceDemo, medicines])
  useEffect(() => { if (forceDemo) localStorage.setItem('smb_schedules', JSON.stringify(schedules)) }, [forceDemo, schedules])
  useEffect(() => { if (forceDemo) localStorage.setItem('smb_logs', JSON.stringify(logs)) }, [forceDemo, logs])
  useEffect(() => { if (forceDemo) localStorage.setItem('smb_notifications', JSON.stringify(notifications)) }, [forceDemo, notifications])
  useEffect(() => { if (forceDemo) localStorage.setItem('smb_device', JSON.stringify(device)) }, [forceDemo, device])
  useEffect(() => { if (forceDemo) localStorage.setItem('smb_profile', JSON.stringify(profile)) }, [forceDemo, profile])

  const ensureUser = () => {
    if (!authUser || !supabase) throw new Error('Please sign in again.')
    return authUser.id
  }

  const addNotification = async notification => {
    if (forceDemo) {
      setNotifications(prev => [{ ...notification, id: notification.id || uid('notif') }, ...prev])
      return
    }
    const userId = ensureUser()
    const { data, error: insertError } = await supabase.from('notifications').insert({ ...notification, user_id: userId }).select().single()
    if (!insertError && data) setNotifications(prev => [data, ...prev])
  }

  const resetDemo = () => {
    if (!forceDemo) return
    setMedicines([...demoMedicines]); setSchedules([...demoSchedules]); setLogs([...demoLogs])
    setNotifications([...demoNotifications]); setDevice({ ...demoDevice, last_sync: new Date().toISOString() }); setProfileState({ ...demoProfile })
    localStorage.setItem('smb_demo_date', localDateKey())
  }

  const addMedicine = async medicine => {
    if (forceDemo) {
      setMedicines(prev => [...prev, { ...medicine, id: uid('med') }])
      return true
    }
    try {
      const userId = ensureUser()
      const { data, error: insertError } = await supabase.from('medicines').insert({ ...medicine, user_id: userId }).select().single()
      if (insertError) throw insertError
      setMedicines(prev => [...prev, data])
      await supabase.from('compartments').upsert({ user_id: userId, number: Number(data.compartment), medicine_id: data.id, status: data.active ? 'Ready' : 'Empty' }, { onConflict: 'user_id,number' })
      return true
    } catch (err) { setError(err.message); return false }
  }

  const editMedicine = async (id, medicine) => {
    if (forceDemo) { setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...medicine } : m)); return true }
    try {
      const userId = ensureUser()
      const before = medicines.find(m => m.id === id)
      const { data, error: updateError } = await supabase.from('medicines').update(medicine).eq('id', id).eq('user_id', userId).select().single()
      if (updateError) throw updateError
      setMedicines(prev => prev.map(m => m.id === id ? data : m))
      if (before && Number(before.compartment) !== Number(data.compartment)) {
        await supabase.from('compartments').upsert({ user_id: userId, number: Number(before.compartment), medicine_id: null, status: 'Empty' }, { onConflict: 'user_id,number' })
      }
      await supabase.from('compartments').upsert({ user_id: userId, number: Number(data.compartment), medicine_id: data.id, status: data.active ? 'Ready' : 'Empty' }, { onConflict: 'user_id,number' })
      return true
    } catch (err) { setError(err.message); return false }
  }

  const removeMedicine = async id => {
    if (forceDemo) {
      setMedicines(prev => prev.filter(m => m.id !== id)); setSchedules(prev => prev.filter(s => s.medicine_id !== id)); setLogs(prev => prev.filter(l => l.medicine_id !== id)); return true
    }
    try {
      const userId = ensureUser()
      const medicine = medicines.find(m => m.id === id)
      const { error: deleteError } = await supabase.from('medicines').delete().eq('id', id).eq('user_id', userId)
      if (deleteError) throw deleteError
      setMedicines(prev => prev.filter(m => m.id !== id)); setSchedules(prev => prev.filter(s => s.medicine_id !== id)); setLogs(prev => prev.filter(l => l.medicine_id !== id))
      if (medicine) await supabase.from('compartments').upsert({ user_id: userId, number: Number(medicine.compartment), medicine_id: null, status: 'Empty', next_scheduled_time: null }, { onConflict: 'user_id,number' })
      return true
    } catch (err) { setError(err.message); return false }
  }

  const createTodayLogForSchedule = schedule => ({
    medicine_id: schedule.medicine_id,
    compartment: Number(schedule.compartment), scheduled_date: localDateKey(), scheduled_time: schedule.time,
    taken_at: null, status: schedule.time < new Date().toTimeString().slice(0, 5) ? 'Pending' : 'Upcoming'
  })

  const addSchedule = async schedule => {
    const normalized = { ...schedule, compartment: Number(schedule.compartment) }
    if (forceDemo) {
      const local = { ...normalized, id: uid('sch') }
      setSchedules(prev => [...prev, local])
      if (local.days.includes(getWeekdayShort()) && local.active !== false) setLogs(prev => [...prev, { ...createTodayLogForSchedule(local), id: uid('log') }])
      return true
    }
    try {
      const userId = ensureUser()
      const { data, error: insertError } = await supabase.from('medicine_schedules').insert({ ...normalized, user_id: userId }).select().single()
      if (insertError) throw insertError
      const local = { ...data, time: String(data.time).slice(0, 5), compartment: Number(data.compartment) }
      setSchedules(prev => [...prev, local].sort((a, b) => a.time.localeCompare(b.time)))
      if (local.days.includes(getWeekdayShort()) && local.active !== false) {
        const logPayload = createTodayLogForSchedule(local)
        const { data: log, error: logError } = await supabase.from('medicine_logs').insert({ ...logPayload, user_id: userId }).select().single()
        if (!logError && log) setLogs(prev => [...prev, { ...log, scheduled_time: String(log.scheduled_time).slice(0, 5) }])
      }
      return true
    } catch (err) { setError(err.message); return false }
  }

  const editSchedule = async (id, schedule) => {
    const normalized = { ...schedule, compartment: Number(schedule.compartment) }
    if (forceDemo) {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...normalized } : s))
      setLogs(prev => prev.map(log => log.scheduled_date === localDateKey() && log.medicine_id === normalized.medicine_id ? { ...log, scheduled_time: normalized.time, compartment: normalized.compartment } : log))
      return true
    }
    try {
      const userId = ensureUser()
      const { data, error: updateError } = await supabase.from('medicine_schedules').update(normalized).eq('id', id).eq('user_id', userId).select().single()
      if (updateError) throw updateError
      const local = { ...data, time: String(data.time).slice(0, 5), compartment: Number(data.compartment) }
      setSchedules(prev => prev.map(s => s.id === id ? local : s))
      await loadUserData()
      return true
    } catch (err) { setError(err.message); return false }
  }

  const removeSchedule = async id => {
    const target = schedules.find(s => s.id === id)
    if (forceDemo) {
      setSchedules(prev => prev.filter(s => s.id !== id))
      if (target) setLogs(prev => prev.filter(l => !(l.scheduled_date === localDateKey() && l.medicine_id === target.medicine_id && l.scheduled_time === target.time)))
      return true
    }
    try {
      const userId = ensureUser()
      const { error: deleteError } = await supabase.from('medicine_schedules').delete().eq('id', id).eq('user_id', userId)
      if (deleteError) throw deleteError
      setSchedules(prev => prev.filter(s => s.id !== id))
      if (target) {
        await supabase.from('medicine_logs').delete().eq('user_id', userId).eq('medicine_id', target.medicine_id).eq('scheduled_date', localDateKey()).eq('scheduled_time', target.time)
        setLogs(prev => prev.filter(l => !(l.scheduled_date === localDateKey() && l.medicine_id === target.medicine_id && l.scheduled_time === target.time)))
      }
      return true
    } catch (err) { setError(err.message); return false }
  }

  const markTaken = async logId => {
    const now = new Date().toISOString()
    if (forceDemo) {
      setLogs(prev => prev.map(log => log.id === logId ? { ...log, status: 'Taken', taken_at: now } : log))
      await addNotification({ type: 'reminder', title: 'Medicine taken', message: 'A scheduled medicine was marked as taken.', created_at: now, read: false })
      return true
    }
    try {
      const userId = ensureUser()
      const { data, error: updateError } = await supabase.from('medicine_logs').update({ status: 'Taken', taken_at: now }).eq('id', logId).eq('user_id', userId).select().single()
      if (updateError) throw updateError
      setLogs(prev => prev.map(log => log.id === logId ? { ...log, ...data, scheduled_time: String(data.scheduled_time).slice(0, 5) } : log))
      await addNotification({ type: 'reminder', title: 'Medicine taken', message: 'A scheduled medicine was marked as taken.', created_at: now, read: false })
      return true
    } catch (err) { setError(err.message); return false }
  }

  const triggerReminder = async (medicineName = 'Medicine') => {
    await addNotification({ type: 'reminder', title: 'Medicine reminder', message: `${medicineName} reminder was triggered${forceDemo ? ' in Demo Mode' : ''}.`, created_at: new Date().toISOString(), read: false })
  }

  const snooze = async logId => {
    const until = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    if (forceDemo) setLogs(prev => prev.map(log => log.id === logId ? { ...log, snoozed_until: until } : log))
    await addNotification({ type: 'reminder', title: 'Reminder snoozed', message: 'The medicine reminder was snoozed for 10 minutes.', created_at: new Date().toISOString(), read: false })
  }

  const simulateCompartmentOpen = async (number = 3) => {
    const now = new Date().toISOString()
    if (forceDemo) {
      setDevice(prev => ({ ...prev, last_sync: now, connection: 'Online' }))
      await addNotification({ type: 'compartment', title: 'Compartment opened', message: `Compartment ${number} was opened in Demo Mode.`, created_at: now, read: false })
      return
    }
    const userId = ensureUser()
    await supabase.from('compartments').upsert({ user_id: userId, number, last_opened: now }, { onConflict: 'user_id,number' })
    await addNotification({ type: 'compartment', title: 'Compartment opened', message: `Compartment ${number} was opened.`, created_at: now, read: false })
  }

  const simulateTaken = () => {
    const pending = logs.find(l => ['Pending', 'Upcoming'].includes(l.status) && l.scheduled_date === localDateKey())
    if (pending) markTaken(pending.id)
    return pending
  }

  const simulateTelemetry = async () => {
    const now = new Date().toISOString()
    if (forceDemo) {
      setDevice(prev => ({ ...prev, last_sync: now, connection: 'Online', wifi: 'Connected', battery: Math.max(20, Math.min(100, prev.battery + (Math.random() > 0.5 ? 1 : -1))), temperature: Number((prev.temperature + (Math.random() - 0.5) * 0.6).toFixed(1)), humidity: Math.max(30, Math.min(75, Math.round(prev.humidity + (Math.random() - 0.5) * 2))) }))
      return
    }
    try {
      const userId = ensureUser()
      const current = device
      const next = { user_id: userId, device_id: current.device_id, name: current.name, connection: 'Online', wifi: 'Connected', last_sync: now, firmware: current.firmware || 'v1.0.0', battery: current.battery ?? 100, temperature: current.temperature ?? 25, humidity: current.humidity ?? 50 }
      const { data, error: upsertError } = await supabase.from('device_status').upsert(next, { onConflict: 'user_id,device_id' }).select().single()
      if (upsertError) throw upsertError
      setDevice({ ...data, demo: false })
    } catch (err) { setError(err.message) }
  }

  const setProfile = async nextProfile => {
    setProfileState(nextProfile)
    if (forceDemo) return
    try {
      const userId = ensureUser()
      await supabase.from('profiles').upsert({ id: userId, name: nextProfile.name, email: nextProfile.email, updated_at: new Date().toISOString() })
      await supabase.auth.updateUser({ data: { full_name: nextProfile.name } })
    } catch (err) { setError(err.message) }
  }

  const updateDevice = async nextDevice => {
    setDevice(nextDevice)
    if (forceDemo) return
    try {
      const userId = ensureUser()
      const { data, error: upsertError } = await supabase.from('device_status').upsert({ user_id: userId, device_id: nextDevice.device_id, name: nextDevice.name, connection: nextDevice.connection || 'Offline', wifi: nextDevice.wifi || 'Disconnected', last_sync: nextDevice.last_sync, firmware: nextDevice.firmware || 'v1.0.0', battery: nextDevice.battery, temperature: nextDevice.temperature, humidity: nextDevice.humidity }, { onConflict: 'user_id,device_id' }).select().single()
      if (!upsertError && data) setDevice({ ...data, demo: false })
    } catch (err) { setError(err.message) }
  }

  const markNotificationRead = async id => {
    if (forceDemo) { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); return }
    const userId = ensureUser()
    const { data, error: updateError } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', userId).select().single()
    if (!updateError && data) setNotifications(prev => prev.map(n => n.id === id ? data : n))
  }

  const markAllRead = async () => {
    if (forceDemo) { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); return }
    const userId = ensureUser()
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = async id => {
    if (forceDemo) { setNotifications(prev => prev.filter(n => n.id !== id)); return }
    const userId = ensureUser()
    const { error: deleteError } = await supabase.from('notifications').delete().eq('id', id).eq('user_id', userId)
    if (!deleteError) setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const compartments = useMemo(() => Array.from({ length: 8 }, (_, index) => {
    const number = index + 1
    const medicine = medicines.find(m => Number(m.compartment) === number && m.active)
    const stored = forceDemo ? demoCompartments.find(c => c.number === number) : compartmentRows.find(c => Number(c.number) === number)
    const schedule = schedules.find(s => Number(s.compartment) === number && s.active !== false)
    return {
      id: `comp-${number}`,
      number,
      medicine_id: medicine?.id ?? null,
      medicine: medicine?.name ?? null,
      status: medicine ? 'Ready' : 'Empty',
      next_scheduled_time: schedule?.time ?? null,
      last_opened: stored?.last_opened ?? null
    }
  }), [compartmentRows, forceDemo, medicines, schedules])

  return {
    loading, error, medicines, schedules, logs, notifications, device, profile, compartments, isDemo,
    setDevice: updateDevice, setProfile, setIsDemo: () => {}, resetDemo,
    addMedicine, editMedicine, removeMedicine, addSchedule, editSchedule, removeSchedule,
    markTaken, snooze, triggerReminder, simulateCompartmentOpen, simulateTaken, simulateTelemetry,
    markNotificationRead, markAllRead, deleteNotification, reload: loadUserData
  }
}

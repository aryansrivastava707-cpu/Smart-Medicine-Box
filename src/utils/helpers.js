export const uid = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const localDateKey = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const addDays = (value, offset) => {
  const d = new Date(value)
  d.setDate(d.getDate() + offset)
  return d
}

export const getWeekdayShort = (value = new Date()) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(value).getDay()]

export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value))
}

export const formatTime = (value) => {
  if (!value) return '—'
  const [h, m] = value.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export const formatDateTime = (value) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export const getGreeting = (hour = new Date().getHours()) => hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const isSameDay = (date, other = new Date()) => localDateKey(date) === localDateKey(other)

export const daysShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export const statusClass = (status) => `status-${String(status).toLowerCase()}`

export const percent = (taken, scheduled) => scheduled ? Math.round((taken / scheduled) * 100) : 0

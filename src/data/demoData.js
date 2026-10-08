import { localDateKey, addDays } from '../utils/helpers'

const today = new Date()
const dateKey = (offset = 0) => localDateKey(addDays(today, offset))

export const demoMedicines = [
  { id: 'med-1', name: 'Paracetamol', dosage: '500 mg', notes: 'After food if required', compartment: 3, start_date: dateKey(-20), end_date: dateKey(20), active: true },
  { id: 'med-2', name: 'Vitamin D3', dosage: '1000 IU', notes: 'Morning supplement', compartment: 1, start_date: dateKey(-30), end_date: dateKey(60), active: true },
  { id: 'med-3', name: 'Calcium', dosage: '500 mg', notes: 'Take with water', compartment: 4, start_date: dateKey(-15), end_date: dateKey(45), active: true },
  { id: 'med-4', name: 'Amoxicillin', dosage: '250 mg', notes: 'Complete prescribed course', compartment: 2, start_date: dateKey(-2), end_date: dateKey(5), active: true },
  { id: 'med-5', name: 'Omeprazole', dosage: '20 mg', notes: 'Before breakfast', compartment: 5, start_date: dateKey(-10), end_date: dateKey(30), active: true },
  { id: 'med-6', name: 'Iron Supplement', dosage: '65 mg', notes: 'Avoid taking with tea/coffee', compartment: 6, start_date: dateKey(-5), end_date: dateKey(25), active: true }
]

const makeSchedule = (id, medicine_id, time, frequency, days, compartment) => ({
  id, medicine_id, time, frequency, days, compartment, reminder_enabled: true, active: true
})

export const demoSchedules = [
  makeSchedule('sch-1', 'med-2', '08:00', 'Once daily', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 1),
  makeSchedule('sch-2', 'med-4', '09:00', 'Three times daily', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 2),
  makeSchedule('sch-3', 'med-1', '13:00', 'Once daily', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 3),
  makeSchedule('sch-4', 'med-3', '18:00', 'Once daily', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 4),
  makeSchedule('sch-5', 'med-5', '20:00', 'Once daily', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 5),
  makeSchedule('sch-6', 'med-6', '21:00', 'Once daily', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], 6)
]

export const demoLogs = [
  { id: 'log-1', medicine_id: 'med-2', compartment: 1, scheduled_date: dateKey(0), scheduled_time: '08:00', taken_at: `${dateKey(0)}T08:04:00`, status: 'Taken' },
  { id: 'log-2', medicine_id: 'med-4', compartment: 2, scheduled_date: dateKey(0), scheduled_time: '09:00', taken_at: `${dateKey(0)}T09:03:00`, status: 'Taken' },
  { id: 'log-3', medicine_id: 'med-1', compartment: 3, scheduled_date: dateKey(0), scheduled_time: '13:00', taken_at: null, status: 'Pending' },
  { id: 'log-4', medicine_id: 'med-3', compartment: 4, scheduled_date: dateKey(0), scheduled_time: '18:00', taken_at: null, status: 'Upcoming' },
  { id: 'log-5', medicine_id: 'med-5', compartment: 5, scheduled_date: dateKey(0), scheduled_time: '20:00', taken_at: null, status: 'Upcoming' },
  { id: 'log-6', medicine_id: 'med-6', compartment: 6, scheduled_date: dateKey(0), scheduled_time: '07:00', taken_at: null, status: 'Missed' },
  { id: 'log-7', medicine_id: 'med-4', compartment: 2, scheduled_date: dateKey(-1), scheduled_time: '21:00', taken_at: `${dateKey(-1)}T21:02:00`, status: 'Taken' },
  { id: 'log-8', medicine_id: 'med-1', compartment: 3, scheduled_date: dateKey(-1), scheduled_time: '13:00', taken_at: `${dateKey(-1)}T13:05:00`, status: 'Taken' },
  { id: 'log-9', medicine_id: 'med-3', compartment: 4, scheduled_date: dateKey(-1), scheduled_time: '18:00', taken_at: null, status: 'Missed' },
  { id: 'log-10', medicine_id: 'med-2', compartment: 1, scheduled_date: dateKey(-1), scheduled_time: '08:00', taken_at: `${dateKey(-1)}T08:01:00`, status: 'Taken' }
]

export const demoCompartments = Array.from({ length: 8 }, (_, i) => {
  const number = i + 1
  const med = demoMedicines.find(m => m.compartment === number)
  return {
    id: `comp-${number}`,
    number,
    medicine_id: med?.id ?? null,
    status: med ? 'Ready' : 'Empty',
    next_scheduled_time: demoSchedules.find(s => s.compartment === number)?.time ?? null,
    last_opened: number === 3 ? `${dateKey(0)}T13:05:00` : `${dateKey(-1)}T18:02:00`
  }
})

export const demoNotifications = [
  { id: 'n-1', type: 'reminder', title: 'Medicine reminder', message: 'Paracetamol is scheduled for 1:00 PM.', created_at: `${dateKey(0)}T12:45:00`, read: false },
  { id: 'n-2', type: 'device', title: 'Device online', message: 'Smart Medical Box synced successfully.', created_at: `${dateKey(0)}T11:58:00`, read: false },
  { id: 'n-3', type: 'compartment', title: 'Compartment opened', message: 'Compartment 3 was opened at 1:05 PM.', created_at: `${dateKey(0)}T13:05:00`, read: true },
  { id: 'n-4', type: 'missed', title: 'Missed medicine', message: 'Iron Supplement was not acknowledged at 7:00 AM.', created_at: `${dateKey(0)}T10:30:00`, read: false }
]

export const demoDevice = {
  id: 'device-1',
  name: 'Smart Medical Box',
  device_id: 'SMB-001',
  connection: 'Online',
  wifi: 'Connected',
  last_sync: new Date().toISOString(),
  firmware: 'v1.0.0',
  battery: 82,
  temperature: 27,
  humidity: 51,
  demo: true
}

export const demoProfile = {
  name: 'Demo User',
  email: 'student.demo@example.com'
}

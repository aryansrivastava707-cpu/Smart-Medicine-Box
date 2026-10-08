import { useEffect, useState } from 'react'
import Modal from './Modal'

const week = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const blank = { medicine_id:'', time:'08:00', frequency:'Once daily', days:week, compartment:1, reminder_enabled:true, active:true }

export default function ScheduleForm({ open, schedule, medicines, onClose, onSave }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  useEffect(() => {
    const base = schedule ? { ...blank, ...schedule } : { ...blank, medicine_id: medicines[0]?.id || '', compartment: medicines[0]?.compartment || 1 }
    delete base.medicine
    setForm(base)
    setError('')
  }, [schedule, open, medicines])

  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const selectMedicine = id => {
    const med = medicines.find(m=>m.id===id)
    setForm(p=>({...p, medicine_id:id, compartment:med?.compartment || p.compartment}))
  }
  const toggleDay = day => setForm(p=>({...p, days:p.days.includes(day) ? p.days.filter(d=>d!==day) : [...p.days,day]}))

  const submit = e => {
    e.preventDefault()
    if (!form.medicine_id) return setError('Select a medicine.')
    if (!form.days.length) return setError('Select at least one day.')
    const saved = onSave({ ...form, compartment:Number(form.compartment) }); if (saved !== false) onClose()
  }

  return <Modal open={open} title={schedule ? 'Edit schedule' : 'Create schedule'} onClose={onClose}>
    <form onSubmit={submit} className="form-grid">
      <label className="full">Medicine<select value={form.medicine_id} onChange={e=>selectMedicine(e.target.value)}>{medicines.map(m=><option key={m.id} value={m.id}>{m.name} — {m.dosage}</option>)}</select></label>
      <label>Reminder time<input type="time" value={form.time} onChange={e=>set('time',e.target.value)} /></label>
      <label>Frequency<select value={form.frequency} onChange={e=>set('frequency',e.target.value)}>{['Once daily','Twice daily','Three times daily','Custom'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Compartment<select value={form.compartment} onChange={e=>set('compartment',e.target.value)}>{Array.from({length:8},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
      <div className="full"><span className="field-label">Days</span><div className="day-picker">{week.map(d=><button type="button" key={d} className={form.days.includes(d)?'day selected':'day'} onClick={()=>toggleDay(d)}>{d.slice(0,2)}</button>)}</div></div>
      <label className="checkbox-label full"><input type="checkbox" checked={form.reminder_enabled} onChange={e=>set('reminder_enabled',e.target.checked)} /> Enable reminder</label>
      {error && <p className="form-error full">{error}</p>}
      <div className="modal-actions full"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary">Save schedule</button></div>
    </form>
  </Modal>
}

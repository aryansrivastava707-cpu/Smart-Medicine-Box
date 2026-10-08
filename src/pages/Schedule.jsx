import { useMemo, useState } from 'react'
import { CalendarClock, Edit3, Plus, Trash2 } from 'lucide-react'
import ScheduleForm from '../components/ScheduleForm'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { formatTime } from '../utils/helpers'

export default function Schedule({ data, notify }) {
  const [open,setOpen]=useState(false),[editing,setEditing]=useState(null),[deleting,setDeleting]=useState(null)
  const rows=useMemo(()=>data.schedules.map(s=>({...s,medicine:data.medicines.find(m=>m.id===s.medicine_id)})).filter(s=>s.medicine),[data.schedules,data.medicines])
  const save=s=>{
    const duplicate = data.schedules.some(existing => existing.id !== editing?.id && existing.active !== false && existing.medicine_id === s.medicine_id && existing.time === s.time && existing.days.join('|') === s.days.join('|'))
    if (duplicate) { notify('An identical active schedule already exists.', 'error'); return false }
    editing ? data.editSchedule(editing.id,s) : data.addSchedule(s)
    notify(editing?'Schedule updated.':'Schedule created.')
    setEditing(null)
    return true
  }
  return <div>
    <div className="page-heading"><div><span className="eyebrow">Medication timing</span><h1>Schedule</h1><p>Configure reminder times, frequency and active days.</p></div><button className="button button-primary" onClick={()=>{setEditing(null);setOpen(true)}}><Plus size={17}/> Add schedule</button></div>
    <section className="card schedule-panel"><div className="card-header"><div><span className="eyebrow">Active reminders</span><h2>{rows.length} schedules configured</h2></div><CalendarClock size={21}/></div>{rows.length?<div className="schedule-list">{rows.sort((a,b)=>a.time.localeCompare(b.time)).map(s=><div className="schedule-row" key={s.id}><div className="schedule-time"><strong>{formatTime(s.time)}</strong><span>{s.frequency}</span></div><div className="schedule-med"><div className="mini-pill"><CalendarClock size={15}/></div><div><strong>{s.medicine.name}</strong><span>{s.medicine.dosage} • Compartment #{s.compartment}</span></div></div><div className="day-picker compact">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><span key={d} className={s.days.includes(d)?'day selected':'day'}>{d.slice(0,2)}</span>)}</div><div className="schedule-enabled"><span className={`toggle-dot ${s.reminder_enabled?'on':''}`}/>{s.reminder_enabled?'Reminder on':'Paused'}</div><div className="row-actions"><button className="icon-button" onClick={()=>{setEditing(s);setOpen(true)}} aria-label="Edit schedule"><Edit3 size={16}/></button><button className="icon-button danger-hover" onClick={()=>setDeleting(s)} aria-label="Delete schedule"><Trash2 size={16}/></button></div></div>)}</div>:<EmptyState title="No schedules yet" text="Add a schedule to start planning medication reminders."/>}</section>
    <ScheduleForm open={open} schedule={editing} medicines={data.medicines.filter(m=>m.active)} onClose={()=>{setOpen(false);setEditing(null)}} onSave={save}/>
    <ConfirmDialog open={Boolean(deleting)} title="Delete schedule?" message={`Remove the ${formatTime(deleting?.time)} schedule for ${deleting?.medicine?.name}?`} onCancel={()=>setDeleting(null)} onConfirm={()=>{data.removeSchedule(deleting.id);notify('Schedule deleted.');setDeleting(null)}}/>
  </div>
}

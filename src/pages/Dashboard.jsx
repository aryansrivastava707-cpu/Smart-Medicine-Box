import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BellRing, CalendarDays, Check, ChevronRight, Clock3, Pill, Plus, RotateCcw, Timer, TrendingUp, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { formatTime, getGreeting, percent } from '../utils/helpers'

export default function Dashboard({ data, notify }) {
  const [now,setNow]=useState(new Date())
  const { medicines,schedules,logs }=data
  const today = new Intl.DateTimeFormat('en-CA').format(now)
  const todayLogs = logs.filter(l=>l.scheduled_date===today)
  const taken=todayLogs.filter(l=>l.status==='Taken').length
  const pending=todayLogs.filter(l=>l.status==='Pending').length
  const missed=todayLogs.filter(l=>l.status==='Missed').length
  const scheduled=todayLogs.length
  const next = todayLogs.filter(l=>['Pending','Upcoming'].includes(l.status)).sort((a,b)=>a.scheduled_time.localeCompare(b.scheduled_time))[0]
  const nextMed = medicines.find(m=>m.id===next?.medicine_id)
  const [showAll,setShowAll]=useState(false)
  const rows = (showAll ? todayLogs : todayLogs.slice(0,6)).map(l=>({...l, medicine:medicines.find(m=>m.id===l.medicine_id)}))

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return <div>
    <div className="page-heading">
      <div><span className="eyebrow">Smart Medical Box</span><h1>{getGreeting()}, {data.profile.name.split(' ')[0]}</h1><p>{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})} • {now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'})}</p></div>
      <div className="heading-actions"><Link className="button button-secondary" to="/schedule"><CalendarDays size={17}/> Manage schedule</Link><button className="button button-primary" onClick={()=>{data.triggerReminder(nextMed?.name || 'Medicine');notify('Demo reminder triggered.','success')}}><BellRing size={17}/> Test reminder</button></div>
    </div>

    <div className="demo-banner"><div><strong>{data.isDemo ? 'DEMO MODE' : 'ACCOUNT DATA'}</strong><span>{data.isDemo ? 'Demo data is stored locally for your presentation.' : 'Your medicines, schedules and history are stored in your Supabase account. Live ESP32 telemetry is not connected yet.'}</span></div><Link to="/device">View device <ArrowRight size={15}/></Link></div>

    <section className="stat-grid">
      <Stat icon={Pill} label="Today's Medicines" value={scheduled} meta="scheduled today"/>
      <Stat icon={Check} label="Taken" value={taken} meta={scheduled?`${percent(taken,scheduled)}% of today's schedule`:'No schedules'} tone="success"/>
      <Stat icon={Clock3} label="Pending" value={pending} meta="awaiting acknowledgement" tone="warning"/>
      <Stat icon={XCircle} label="Missed" value={missed} meta="needs attention" tone="danger"/>
    </section>

    <div className="dashboard-grid">
      <section className="card next-card">
        <div className="card-header"><div><span className="eyebrow">Next Medicine</span><h2>{nextMed?.name || 'No pending medicines'}</h2></div><span className="next-time">{next ? formatTime(next.scheduled_time) : 'All clear'}</span></div>
        {next ? <><div className="next-details"><div><span>Dosage</span><strong>{nextMed?.dosage}</strong></div><div><span>Compartment</span><strong>{next.compartment}</strong></div><div><span>Status</span><StatusBadge status={next.status}/></div></div><div className="next-actions"><button className="button button-primary" onClick={()=>{data.markTaken(next.id);notify(`${nextMed?.name} marked as taken.`)}}><Check size={17}/> Mark as Taken</button><button className="button button-secondary" onClick={()=>{data.snooze(next.id);notify('Reminder snoozed for 10 minutes.','info')}}><Timer size={17}/> Snooze</button></div></> : <div className="empty-inline"><Check size={20}/> No pending medicine reminders.</div>}
      </section>

      <section className="card adherence-card">
        <div className="card-header"><div><span className="eyebrow">Today at a glance</span><h2>Adherence snapshot</h2></div><TrendingUp size={20}/></div>
        <div className="adherence-ring" style={{'--progress':`${percent(taken,scheduled)}%`}}><div><strong>{percent(taken,scheduled)}%</strong><span>taken</span></div></div>
        <div className="legend"><span><i className="legend-dot success"/> Taken <b>{taken}</b></span><span><i className="legend-dot warning"/> Pending <b>{pending}</b></span><span><i className="legend-dot danger"/> Missed <b>{missed}</b></span></div>
      </section>
    </div>

    <section className="card table-card">
      <div className="card-header"><div><span className="eyebrow">Today</span><h2>Medication schedule</h2></div><Link className="text-link" to="/history">View history <ChevronRight size={15}/></Link></div>
      {rows.length ? <div className="table-wrap"><table><thead><tr><th>Time</th><th>Medicine</th><th>Dosage</th><th>Compartment</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(l=><tr key={l.id}><td><strong>{formatTime(l.scheduled_time)}</strong></td><td><div className="medicine-cell"><div className="mini-pill"><Pill size={15}/></div><span>{l.medicine?.name||'Unknown'}</span></div></td><td>{l.medicine?.dosage||'—'}</td><td>#{l.compartment}</td><td><StatusBadge status={l.status}/></td><td>{['Pending','Upcoming'].includes(l.status)?<button className="table-action" onClick={()=>{data.markTaken(l.id);notify(`${l.medicine?.name} marked as taken.`)}}><Check size={15}/> Take</button>:<span className="muted">{l.taken_at?'Recorded':'No action'}</span>}</td></tr>)}</tbody></table></div>:<div className="empty-state">No medication schedule for today.</div>}
      {todayLogs.length>6 && <button className="table-more" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show less':'Show all today'} <ChevronRight size={15}/></button>}
    </section>
  </div>
}

function Stat({icon:Icon,label,value,meta,tone=''}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong><small>{meta}</small></div></div>
}

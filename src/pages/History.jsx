import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Search, XCircle } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { formatDate, formatDateTime, formatTime, localDateKey, percent } from '../utils/helpers'

export default function History({ data }) {
  const [range,setRange]=useState('today')
  const [query,setQuery]=useState('')
  const [from,setFrom]=useState(localDateKey())
  const [to,setTo]=useState(localDateKey())
  const today=new Date()
  const cutoff=new Date()
  if(range==='week') cutoff.setDate(today.getDate()-7)
  if(range==='month') cutoff.setDate(today.getDate()-30)

  const logs=useMemo(()=>data.logs
    .map(l=>({...l,medicine:data.medicines.find(m=>m.id===l.medicine_id)}))
    .filter(l=>!query||l.medicine?.name.toLowerCase().includes(query.toLowerCase()))
    .filter(l=>{
      if(range==='today') return l.scheduled_date===localDateKey(today)
      if(range==='custom') return l.scheduled_date>=from && l.scheduled_date<=to
      return new Date(`${l.scheduled_date}T23:59:59`)>=cutoff
    }),[data.logs,data.medicines,query,range,from,to,today])

  const taken=logs.filter(l=>l.status==='Taken').length
  const missed=logs.filter(l=>l.status==='Missed').length

  return <div>
    <div className="page-heading"><div><span className="eyebrow">Medication record</span><h1>Medication History</h1><p>Review acknowledgement events and schedule outcomes.</p></div></div>
    <div className="history-stats"><div className="card mini-stat"><CheckCircle2/><div><span>Total taken</span><strong>{taken}</strong></div></div><div className="card mini-stat"><XCircle/><div><span>Total missed</span><strong>{missed}</strong></div></div><div className="card mini-stat"><CalendarDays/><div><span>Total scheduled</span><strong>{logs.length}</strong></div></div><div className="card mini-stat"><div className="mini-progress"><span style={{width:`${percent(taken,logs.length)}%`}}/></div><div><span>Adherence</span><strong>{percent(taken,logs.length)}%</strong></div></div></div>
    <section className="card table-card">
      <div className="toolbar-inline">
        <div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search medicine…" aria-label="Search medicine history"/></div>
        <div className="filter-tabs"><button className={range==='today'?'active':''} onClick={()=>setRange('today')}>Today</button><button className={range==='week'?'active':''} onClick={()=>setRange('week')}>This week</button><button className={range==='month'?'active':''} onClick={()=>setRange('month')}>This month</button><button className={range==='custom'?'active':''} onClick={()=>setRange('custom')}>Custom</button></div>
      </div>
      {range==='custom'&&<div className="custom-date-filter"><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" min={from} value={to} onChange={e=>setTo(e.target.value)}/></label></div>}
      <div className="table-wrap"><table><thead><tr><th>Date</th><th>Medicine</th><th>Compartment</th><th>Scheduled</th><th>Taken time</th><th>Status</th></tr></thead><tbody>{logs.map(l=><tr key={l.id}><td>{formatDate(l.scheduled_date)}</td><td><strong>{l.medicine?.name||'Unknown'}</strong><div className="muted">{l.medicine?.dosage}</div></td><td>#{l.compartment}</td><td>{formatTime(l.scheduled_time)}</td><td>{l.taken_at?formatDateTime(l.taken_at):'—'}</td><td><StatusBadge status={l.status}/></td></tr>)}</tbody></table></div>{!logs.length&&<div className="empty-state">No history matches these filters.</div>}
    </section>
    <p className="disclaimer">Adherence is a simple dashboard statistic calculated from recorded demo events. It is not a clinical or medical assessment.</p>
  </div>
}

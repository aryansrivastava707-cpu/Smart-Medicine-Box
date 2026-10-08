import { Boxes, DoorOpen, PackageCheck, Radio } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime, formatTime } from '../utils/helpers'

export default function Compartments({ data, notify }) {
  return <div>
    <div className="page-heading"><div><span className="eyebrow">Physical box layout</span><h1>Compartments</h1><p>Monitor medicine assignment and simulated compartment events.</p></div><button className="button button-secondary" onClick={()=>{data.simulateCompartmentOpen(3);notify('Compartment 3 open event simulated.','info')}}><DoorOpen size={17}/> Simulate Open</button></div>
    <section className="box-visual card"><div className="box-lid"><div className="box-brand"><Boxes size={22}/><span>SMART MEDICAL BOX</span></div><span className="box-sensor"><Radio size={15}/> ESP32 • Demo</span></div><div className="compartment-grid">{data.compartments.map(c=><div className={`compartment-cell ${c.status==='Empty'?'empty':''}`} key={c.number}><div className="compartment-number">{c.number}</div><div className="compartment-icon"><PackageCheck size={22}/></div><strong>{c.medicine||'Empty slot'}</strong><StatusBadge status={c.status}/><div className="compartment-meta"><span>Next <b>{c.next_scheduled_time?formatTime(c.next_scheduled_time):'—'}</b></span><span>Last open <b>{formatDateTime(c.last_opened)}</b></span></div></div>)}</div></section>
    <div className="info-strip"><Radio size={18}/><div><strong>Hardware mapping ready</strong><span>Each compartment has a stable number for future ESP32 sensor events. Demo actions do not represent a real hardware signal.</span></div></div>
  </div>
}

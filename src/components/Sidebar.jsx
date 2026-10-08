import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Pill, CalendarClock, Boxes, History, Bell, Cpu, Settings, Menu, X, Activity } from 'lucide-react'

const nav = [
  ['Dashboard','/','LayoutDashboard'], ['Medicines','/medicines','Pill'], ['Schedule','/schedule','CalendarClock'],
  ['Compartments','/compartments','Boxes'], ['Medication History','/history','History'], ['Notifications','/notifications','Bell'],
  ['Device','/device','Cpu'], ['Settings','/settings','Settings']
]
const icons = { LayoutDashboard, Pill, CalendarClock, Boxes, History, Bell, Cpu, Settings }

export default function Sidebar({ mobileOpen, setMobileOpen, profile, device }) {
  return <aside className={`sidebar ${mobileOpen?'open':''}`}>
    <div className="brand"><div className="brand-mark"><Activity size={22}/></div><div><strong>Smart Medical Box</strong><span>IoT Care Dashboard</span></div><button className="mobile-close icon-button" onClick={()=>setMobileOpen(false)} aria-label="Close menu"><X size={20}/></button></div>
    <nav>{nav.map(([label,path,icon])=>{ const Icon=icons[icon]; return <NavLink key={path} to={path} end={path==='/' } onClick={()=>setMobileOpen(false)} className={({isActive})=>isActive?'nav-link active':'nav-link'}><Icon size={19}/><span>{label}</span></NavLink>})}</nav>
    <div className="sidebar-footer">
      <div className="device-mini"><span className={`dot ${device.connection==='Online'?'online':'offline'}`}/><div><strong>{device.connection}</strong><small>{device.demo?'Demo device':'Connected device'}</small></div></div>
      <div className="profile-mini"><div className="avatar">{profile.name?.slice(0,1) || 'U'}</div><div><strong>{profile.name}</strong><small>{profile.email}</small></div></div>
    </div>
  </aside>
}

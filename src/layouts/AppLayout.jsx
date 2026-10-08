import { useState } from 'react'
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function AppLayout({ children, profile, device, unreadCount, isDemo, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return <div className="app-shell">
    <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} profile={profile} device={device}/>
    {mobileOpen && <div className="mobile-overlay" onClick={()=>setMobileOpen(false)}/>}
    <main className="main-shell">
      <header className="topbar">
        <button className="menu-button icon-button" onClick={()=>setMobileOpen(true)} aria-label="Open menu"><Menu size={21}/></button>
        <div className="topbar-spacer"/>
        <div className="connection-pill"><span className={`dot ${device.connection==='Online'?'online':'offline'}`}/><span>{device.connection}</span></div>
        <div className="demo-pill">{isDemo ? 'DEMO MODE' : 'ACCOUNT MODE'}</div>
        <Link to="/notifications" className="notification-button icon-button" aria-label="Notifications"><Bell size={19}/>{unreadCount>0&&<span>{unreadCount}</span>}</Link>
        <div className="top-profile"><div className="avatar small">{profile.name?.slice(0,1)||'U'}</div><span>{profile.name}</span><button className="icon-button" onClick={onLogout} aria-label="Log out" title="Log out"><LogOut size={16}/></button></div>
      </header>
      <div className="page-container">{children}</div>
      <footer className="site-footer">Student prototype • Not a certified medical device • Smart Medical Box</footer>
    </main>
  </div>
}

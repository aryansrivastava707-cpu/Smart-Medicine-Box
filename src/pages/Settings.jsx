import { Download, LogOut, Moon, RotateCcw, Save, Settings as SettingsIcon, ShieldCheck, Sun, Trash2, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function Settings({ data, notify, onLogout, dark, setDark }) {
  const [profile,setProfile] = useState(data.profile)
  const [reminders,setReminders] = useLocalStorage('smb_reminder_settings',{enabled:true,sound:true,snooze:10})

  useEffect(() => setProfile(data.profile), [data.profile])

  const saveProfile = () => { data.setProfile(profile); notify('Profile settings saved.') }
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(data.logs,null,2)],{type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='smart-medical-box-history.json'; a.click(); URL.revokeObjectURL(url)
    notify('History exported.')
  }
  const clear = () => { if(window.confirm('Clear demo data and restore the original demo dataset?')){data.resetDemo();notify('Demo data restored.','info')} }

  return <div>
    <div className="page-heading"><div><span className="eyebrow">Preferences</span><h1>Settings</h1><p>Profile, reminder and demo-data controls.</p></div></div>
    <div className="settings-layout">
      <section className="card settings-section"><div className="settings-title"><div className="settings-icon"><ShieldCheck size={19}/></div><div><h2>Profile</h2><p>Basic dashboard identity.</p></div></div><div className="form-grid"><label>Name<input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Email<input type="email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label></div><div className="settings-actions"><button className="button button-primary" onClick={saveProfile}><Save size={16}/> Save profile</button><button className="button button-secondary" onClick={onLogout}><LogOut size={16}/> Log out</button></div></section>
      <section className="card settings-section"><div className="settings-title"><div className="settings-icon"><Volume2 size={19}/></div><div><h2>Reminder Settings</h2><p>Control how dashboard reminders behave.</p></div></div><SettingToggle label="Enable reminders" checked={reminders.enabled} onChange={v=>setReminders({...reminders,enabled:v})}/><SettingToggle label="Sound notifications" checked={reminders.sound} onChange={v=>setReminders({...reminders,sound:v})}/><label className="setting-select">Snooze duration<select value={reminders.snooze} onChange={e=>setReminders({...reminders,snooze:Number(e.target.value)})}><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label></section>
      <section className="card settings-section"><div className="settings-title"><div className="settings-icon"><SettingsIcon size={19}/></div><div><h2>Device Settings</h2><p>{data.isDemo ? 'Local demo device identity.' : 'Your account device identity.'}</p></div></div><label>Device name<input value={data.device.name} onChange={e=>data.setDevice({...data.device,name:e.target.value})}/></label><div className="device-setting-row"><span>Wi-Fi status</span><strong><span className="dot online"/> {data.device.wifi}</strong></div></section>
      <section className="card settings-section"><div className="settings-title"><div className="settings-icon"><Sun size={19}/></div><div><h2>Appearance</h2><p>Choose a presentation theme.</p></div></div><div className="theme-switch"><button className={!dark?'selected':''} onClick={()=>setDark(false)}><Sun size={17}/> Light</button><button className={dark?'selected':''} onClick={()=>setDark(true)}><Moon size={17}/> Dark</button></div><p className="muted small">Theme preference is saved locally on this browser.</p></section>
      <section className="card settings-section danger-section"><div className="settings-title"><div className="settings-icon danger"><Trash2 size={19}/></div><div><h2>Data</h2><p>Export your medication history or manage Demo Mode data.</p></div></div><div className="data-actions"><button className="button button-secondary" onClick={exportHistory}><Download size={16}/> Export history</button>{data.isDemo && <button className="button button-danger" onClick={clear}><RotateCcw size={16}/> Restore demo data</button>}</div></section>
    </div>
    <div className="about-project"><div><span className="eyebrow">About the project</span><h2>IoT-Based Smart Medical Box for Medication Reminder and Monitoring</h2><p>This system is a student prototype designed to assist with medication scheduling and organization. It combines an embedded smart box concept, ESP32 connectivity, database-ready data services and a responsive web dashboard.</p></div><div className="about-badge"><ShieldCheck size={18}/><span>Not a certified<br/>medical device</span></div></div>
  </div>
}
function SettingToggle({label,checked,onChange}){return <div className="setting-row"><span>{label}</span><button type="button" className={`switch ${checked?'on':''}`} onClick={()=>onChange(!checked)} role="switch" aria-checked={checked}><span/></button></div>}

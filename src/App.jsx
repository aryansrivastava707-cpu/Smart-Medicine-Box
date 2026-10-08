import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Routes, Route, useNavigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Medicines from './pages/Medicines'
import Schedule from './pages/Schedule'
import Compartments from './pages/Compartments'
import History from './pages/History'
import Notifications from './pages/Notifications'
import Device from './pages/Device'
import Settings from './pages/Settings'
import { useDemoData } from './hooks/useDemoData'
import Toast from './components/Toast'
import { supabase, supabaseConfigured } from './services/supabase'

export default function App() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(() => sessionStorage.getItem('smb_demo_auth') === 'true')
  const [toast, setToast] = useState(null)
  const [dark, setDark] = useLocalStorage('smb_dark_mode', false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', Boolean(dark))
  }, [dark])
  const data = useDemoData(demoMode, authUser)
  const notify = (message, type='success') => {
    setToast({message,type})
    window.clearTimeout(window.__smbToast)
    window.__smbToast = window.setTimeout(() => setToast(null), 3200)
  }
  const unreadCount = useMemo(() => data.notifications.filter(n => !n.read).length, [data.notifications])

  useEffect(() => {
    let active = true
    if (sessionStorage.getItem('smb_demo_auth') === 'true') {
      setAuthenticated(true)
      setAuthUser(null)
      setDemoMode(true)
      setAuthLoading(false)
      return () => { active = false }
    }
    if (!supabaseConfigured) {
      setAuthenticated(false)
      setAuthUser(null)
      setAuthLoading(false)
      return () => { active = false }
    }
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return
      setAuthenticated(Boolean(sessionData.session))
      setAuthUser(sessionData.session?.user ?? null)
      setDemoMode(false)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setAuthenticated(Boolean(session))
      setAuthUser(session?.user ?? null)
      setDemoMode(false)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  const login = (mode = 'supabase', user = null) => {
    if (mode === 'demo') {
      sessionStorage.setItem('smb_demo_auth', 'true')
      localStorage.removeItem('smb_profile')
      setAuthUser(null)
      setDemoMode(true)
    } else {
      sessionStorage.removeItem('smb_demo_auth')
      setDemoMode(false)
      if (user) setAuthUser(user)
    }
    setAuthenticated(true)
    navigate('/')
  }

  const logout = async () => {
    if (supabaseConfigured && !demoMode) await supabase.auth.signOut()
    sessionStorage.removeItem('smb_demo_auth')
    setAuthUser(null)
    setAuthenticated(false)
    setDemoMode(false)
    navigate('/')
  }

  if (authLoading) return <div className="loading-state full-page-loading"><span className="spinner"/> Loading Smart Medical Box…</div>
  if (authenticated && data.loading) return <div className="loading-state full-page-loading"><span className="spinner"/> Loading your Smart Medical Box data…</div>
  if (!authenticated) return <Routes><Route path="/reset-password" element={<ResetPassword onComplete={()=>navigate('/')} notify={notify}/>}/><Route path="*" element={<><Login onLogin={login} notify={notify}/><Toast toast={toast} onClose={()=>setToast(null)}/></>}/></Routes>

  return <AppLayout profile={data.profile} device={data.device} unreadCount={unreadCount} isDemo={data.isDemo} onLogout={logout}>
    <Routes>
      <Route path="/" element={<Dashboard data={data} notify={notify}/>}/>
      <Route path="/medicines" element={<Medicines data={data} notify={notify}/>}/>
      <Route path="/schedule" element={<Schedule data={data} notify={notify}/>}/>
      <Route path="/compartments" element={<Compartments data={data} notify={notify}/>}/>
      <Route path="/history" element={<History data={data}/>}/>
      <Route path="/notifications" element={<Notifications data={data} notify={notify}/>}/>
      <Route path="/device" element={<Device data={data} notify={notify}/>}/>
      <Route path="/settings" element={<Settings data={data} notify={notify} onLogout={logout} dark={dark} setDark={setDark}/>}/>
      <Route path="/reset-password" element={<ResetPassword onComplete={()=>navigate('/')} notify={notify}/>}/>
    </Routes>
    <Toast toast={toast} onClose={()=>setToast(null)}/>
  </AppLayout>
}

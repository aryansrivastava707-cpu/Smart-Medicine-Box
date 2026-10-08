import { useState } from 'react'
import { Activity, ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { supabaseConfigured, supabase } from '../services/supabase'

export default function Login({ onLogin, notify }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const demo = () => onLogin('demo')
  const switchMode = nextMode => {
    setMode(nextMode)
    setError('')
    setConfirmPassword('')
  }

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Enter your email and password.')
    if (!supabaseConfigured) return setError('Supabase is not configured. Use Demo Mode for the college demonstration.')

    if (mode === 'signup') {
      if (!name.trim()) return setError('Enter your name.')
      if (password.length < 6) return setError('Password must be at least 6 characters.')
      if (password !== confirmPassword) return setError('Passwords do not match.')
    }

    setLoading(true)
    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: window.location.origin
        }
      })
      setLoading(false)
      if (signUpError) return setError(signUpError.message)
      if (data.session) {
        onLogin('supabase', data.session.user)
      } else {
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        notify('Account created. Check your email to confirm your account, then log in.', 'info')
      }
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (loginError) setError(loginError.message)
    else {
      if (remember) localStorage.setItem('smb_remember', 'true')
      onLogin('supabase', (await supabase.auth.getUser()).data.user)
    }
  }

  const title = mode === 'signup' ? 'Create your account' : 'Sign in to dashboard'
  const subtitle = mode === 'signup'
    ? 'Create a secure Supabase account to access your dashboard.'
    : 'Use your Supabase account or start the college-ready demo.'

  return <div className="login-page">
    <div className="login-visual">
      <div className="login-brand"><div className="brand-mark large"><Activity size={27}/></div><span>Smart Medical Box</span></div>
      <div className="visual-copy"><span className="eyebrow">IoT medication assistance</span><h1>Medication reminders, organized in one place.</h1><p>A student-built dashboard connecting a smart medicine box, embedded sensing and a secure web experience.</p>
        <div className="feature-list"><div><CheckCircle2/> <span>Schedule and track medicines</span></div><div><ShieldCheck/> <span>Device monitoring ready</span></div><div><Activity/> <span>Works offline in Demo Mode</span></div></div>
      </div>
      <div className="visual-note">Student prototype • Healthcare assistance only</div>
    </div>
    <div className="login-panel">
      <div className="login-card">
        <div className="mobile-brand"><div className="brand-mark"><Activity size={22}/></div><strong>Smart Medical Box</strong></div>
        <span className="eyebrow">{mode === 'signup' ? 'New account' : 'Welcome back'}</span><h2>{title}</h2><p className="muted">{subtitle}</p>
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => switchMode('login')} aria-selected={mode === 'login'}>Login</button>
          <button type="button" className={mode === 'signup' ? 'selected' : ''} onClick={() => switchMode('signup')} aria-selected={mode === 'signup'}>Sign up</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>Full name<div className="input-icon"><UserRound size={17}/><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/></div></label>}
          <label>Email<div className="input-icon"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></div></label>
          <label>Password<div className="input-icon"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}/></div></label>
          {mode === 'signup' && <label>Confirm password<div className="input-icon"><LockKeyhole size={17}/><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"/></div></label>}
          {mode === 'login' && <div className="login-options"><label className="checkbox-label"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Remember me</label><button type="button" className="link-button" onClick={async ()=>{ if(!email) return setError('Enter your email first.'); if(!supabaseConfigured) return notify('Supabase is not configured. Password recovery is available after Supabase setup.','info'); setError(''); const { error } = await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`}); if(error) setError(error.message); else notify('Password reset email sent. Check your inbox.','info') }}>Forgot password?</button></div>}
          {error && <div className="inline-error">{error}</div>}
          <button className="button button-primary button-wide" disabled={loading}>{loading ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Login')} <ArrowRight size={17}/></button>
        </form>
        <div className="or-divider"><span>or</span></div>
        <button className="button button-demo button-wide" onClick={demo}>Enter Demo Mode <Activity size={17}/></button>
        <div className="login-footnote"><span className="dot online"/> {supabaseConfigured?'Supabase configured':'Demo-ready'} • No API keys are hardcoded</div>
      </div>
    </div>
  </div>
}

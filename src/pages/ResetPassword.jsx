import { useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { supabase, supabaseConfigured } from '../services/supabase'

export default function ResetPassword({ onComplete, notify }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!ready) return setError('Open this page from the password-reset email.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) return setError(updateError.message)
    notify('Password updated successfully.')
    onComplete()
  }

  return <div className="login-page"><div className="login-panel" style={{gridColumn:'1 / -1'}}><div className="login-card">
    <span className="eyebrow">Account security</span>
    <h2>Set a new password</h2>
    <p className="muted">Choose a new password for your Smart Medical Box account.</p>
    {!supabaseConfigured && <div className="inline-error">Supabase is not configured. Use Demo Mode instead.</div>}
    <form onSubmit={submit}>
      <label>New password<div className="input-icon"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters"/></div></label>
      <label>Confirm password<div className="input-icon"><LockKeyhole size={17}/><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repeat password"/></div></label>
      {error && <div className="inline-error">{error}</div>}
      <button className="button button-primary button-wide" disabled={loading}>{loading?'Updating…':'Update password'} <ArrowRight size={17}/></button>
    </form>
  </div></div></div>
}

import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null
  const Icon = toast.type === 'error' ? XCircle : toast.type === 'info' ? Info : CheckCircle2
  return (
    <div className={`toast toast-${toast.type || 'success'}`} role="status">
      <Icon size={18} />
      <span>{toast.message}</span>
      <button aria-label="Close notification" onClick={onClose}><X size={16}/></button>
    </div>
  )
}

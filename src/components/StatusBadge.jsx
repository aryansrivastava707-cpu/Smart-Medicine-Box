import { CheckCircle2, Clock3, AlertTriangle, CircleDashed, Wifi, WifiOff } from 'lucide-react'

const icons = {
  Taken: CheckCircle2, Pending: Clock3, Missed: AlertTriangle, Upcoming: CircleDashed,
  Online: Wifi, Offline: WifiOff, Ready: CheckCircle2, Empty: CircleDashed
}

export default function StatusBadge({ status }) {
  const Icon = icons[status] || CircleDashed
  return <span className={`status-badge status-${String(status).toLowerCase()}`}><Icon size={14}/>{status}</span>
}

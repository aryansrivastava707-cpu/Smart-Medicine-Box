import { Bell, Check, CheckCheck, CircleAlert, DoorOpen, Info, Trash2, Wifi } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { formatDateTime } from '../utils/helpers'

const iconMap = { reminder: Bell, missed: CircleAlert, compartment: DoorOpen, device: Wifi, system: Info }

export default function Notifications({ data, notify }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Alerts & events</span>
          <h1>Notifications</h1>
          <p>Reminder, device and compartment events from your dashboard.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary" onClick={() => { data.markAllRead(); notify('All notifications marked as read.') }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>
      </div>

      <section className="card notification-list">
        {data.notifications.length ? (
          data.notifications.map((n) => {
            const Icon = iconMap[n.type] || Info
            return (
              <article className={`notification-row ${n.read ? 'read' : ''}`} key={n.id}>
                <div className={`notification-icon ${n.type}`}><Icon size={18} /></div>
                <div className="notification-content">
                  <div><strong>{n.title}</strong>{!n.read && <span className="unread-dot" />}</div>
                  <p>{n.message}</p>
                  <time>{formatDateTime(n.created_at)}</time>
                </div>
                <div className="notification-actions">
                  {!n.read && <button className="icon-button" onClick={() => { data.markNotificationRead(n.id); notify('Notification marked as read.', 'info') }} title="Mark as read" aria-label="Mark as read"><Check size={16} /></button>}
                  <button className="icon-button danger-hover" onClick={() => { data.deleteNotification(n.id); notify('Notification deleted.', 'info') }} title="Delete" aria-label="Delete notification"><Trash2 size={16} /></button>
                </div>
              </article>
            )
          })
        ) : (
          <EmptyState title="You're all caught up" text="New medication and device events will appear here." />
        )}
      </section>
    </div>
  )
}

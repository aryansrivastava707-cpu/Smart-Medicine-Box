import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, title, children, onClose, width = '560px' }) {
  useEffect(() => {
    if (!open) return
    const handler = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={19}/></button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  )
}

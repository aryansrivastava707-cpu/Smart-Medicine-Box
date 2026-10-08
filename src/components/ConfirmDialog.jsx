import Modal from './Modal'
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return <Modal open={open} title={title} onClose={onCancel} width="440px">
    <p className="confirm-message">{message}</p>
    <div className="modal-actions">
      <button className="button button-secondary" onClick={onCancel}>Cancel</button>
      <button className="button button-danger" onClick={onConfirm}>Delete</button>
    </div>
  </Modal>
}

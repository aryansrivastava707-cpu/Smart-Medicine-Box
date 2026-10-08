import { useEffect, useState } from 'react'
import Modal from './Modal'
import { localDateKey } from '../utils/helpers'

const blank = { name:'', dosage:'', notes:'', compartment:1, start_date:localDateKey(), end_date:'', active:true }

export default function MedicineForm({ open, medicine, onClose, onSave }) {
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')

  useEffect(() => { setForm(medicine ? { ...blank, ...medicine } : { ...blank }); setError('') }, [medicine, open])
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = e => {
    e.preventDefault()
    if (!form.name.trim() || !form.dosage.trim()) return setError('Medicine name and dosage are required.')
    if (Number(form.compartment) < 1 || Number(form.compartment) > 8) return setError('Compartment must be between 1 and 8.')
    if (form.end_date && form.start_date > form.end_date) return setError('End date must be on or after the start date.')
    const saved = onSave({ ...form, compartment:Number(form.compartment) })
    if (saved !== false) onClose()
  }

  return <Modal open={open} title={medicine ? 'Edit medicine' : 'Add medicine'} onClose={onClose}>
    <form onSubmit={submit} className="form-grid">
      <label>Medicine name<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Paracetamol" /></label>
      <label>Dosage<input value={form.dosage} onChange={e=>set('dosage',e.target.value)} placeholder="e.g. 500 mg" /></label>
      <label className="full">Description / notes<textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Optional notes"/></label>
      <label>Compartment<select value={form.compartment} onChange={e=>set('compartment',e.target.value)}>{Array.from({length:8},(_,i)=><option key={i+1} value={i+1}>Compartment {i+1}</option>)}</select></label>
      <label>Start date<input type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)} /></label>
      <label>End date<input type="date" value={form.end_date || ''} onChange={e=>set('end_date',e.target.value)} /></label>
      <label className="checkbox-label full"><input type="checkbox" checked={form.active} onChange={e=>set('active',e.target.checked)} /> Active medicine</label>
      {error && <p className="form-error full">{error}</p>}
      <div className="modal-actions full"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary">Save medicine</button></div>
    </form>
  </Modal>
}

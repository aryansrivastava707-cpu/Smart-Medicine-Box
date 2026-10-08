export default function Loading({ text = 'Loading...' }) {
  return <div className="loading-state"><div className="spinner"/><span>{text}</span></div>
}

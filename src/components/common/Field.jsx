// Labelled input bound to a value. type: text | number | date | area
export default function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label>
      {label}
      {type === 'area'
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input type={type} value={value} onChange={(e) => onChange(type === 'number' ? Math.max(0, +e.target.value || 0) : e.target.value)} />}
    </label>
  );
}

import { num } from '../../../shared/logic.js';
import Badge, { toneOf } from './Badge.jsx';

// Generic editable table. cols = [[key, label, type, options], ...]; type: text | num | date | sel | ids | ro
export default function DataTable({ rows, cols, set, del }) {
  return (
    <div className="tw">
      <table>
        <thead><tr>{cols.map((c) => <th key={c[0]}>{c[1]}</th>)}{del && <th />}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {cols.map(([k, , type, opts]) => <td key={k}><Cell row={r} k={k} type={type} opts={opts} set={set} /></td>)}
              {del && <td><button className="x" onClick={() => del(r.id)}>Delete</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ row, k, type, opts, set }) {
  const v = row[k];
  if (type === 'ro') {
    if (typeof v === 'string' && toneOf(v)) return <Badge tone={toneOf(v)}>{v}</Badge>;
    return <span className={typeof v === 'number' ? 'num' : ''}>{typeof v === 'number' ? Math.round(v).toLocaleString() : v}</span>;
  }
  if (type === 'ids') {
    const parse = (s) => s.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
    return <input key={v.join()} defaultValue={v.join(', ')} onBlur={(e) => set(row.id, k, parse(e.target.value))} />;
  }
  if (type === 'sel') {
    return (
      <select data-tone={toneOf(v)} value={v} onChange={(e) => set(row.id, k, e.target.value)}>
        {opts.map((o) => { const [a, b] = Array.isArray(o) ? o : [o, o]; return <option key={a} value={a}>{b}</option>; })}
      </select>
    );
  }
  const htmlType = type === 'num' ? 'number' : type === 'date' ? 'date' : 'text';
  return <input type={htmlType} min={0} value={v ?? ''} onChange={(e) => set(row.id, k, type === 'num' ? num(k, e.target.value) : e.target.value)} />;
}

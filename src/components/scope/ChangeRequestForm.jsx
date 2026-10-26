import { useState } from 'react';

const BLANK = { title: '', type: 'Add', by: '', why: '', cost: 0, days: 0, reqs: [], newReq: '' };

export default function ChangeRequestForm({ p }) {
  const [f, setF] = useState(BLANK);
  const [errs, setErrs] = useState([]);
  const upd = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const eligible = p.db.reqs.filter((r) => (f.type === 'Add' ? r.status === 'Proposed' : r.status === 'Approved'));
  const toggle = (id) => upd('reqs', f.reqs.includes(id) ? f.reqs.filter((x) => x !== id) : [...f.reqs, id]);
  const submit = () => { const e = p.submitChange(f); setErrs(e); if (!e.length) setF(BLANK); };
  return (
    <div className="card np">
      <b>Submit a change request</b>
      <div className="frm">
        <label>Title<input value={f.title} onChange={(e) => upd('title', e.target.value)} /></label>
        <label>Type
          <select value={f.type} onChange={(e) => setF((x) => ({ ...x, type: e.target.value, reqs: [] }))}>
            <option value="Add">Add (new requirement)</option><option value="Modify">Modify (approved requirement)</option>
          </select>
        </label>
        <label>Requested by<input value={f.by} onChange={(e) => upd('by', e.target.value)} /></label>
        <label>Cost impact (PKR)<input type="number" min={0} value={f.cost} onChange={(e) => upd('cost', Math.max(0, +e.target.value || 0))} /></label>
        <label>Schedule impact (days)<input type="number" min={0} step={1} value={f.days} onChange={(e) => upd('days', Math.max(0, Math.round(+e.target.value || 0)))} /></label>
        {f.type === 'Add' && <label>Or propose a new requirement<input value={f.newReq} placeholder="Requirement title" onChange={(e) => upd('newReq', e.target.value)} /></label>}
      </div>
      <label>Justification<textarea rows={2} value={f.why} onChange={(e) => upd('why', e.target.value)} /></label>
      <p style={{ marginBottom: 4 }}>Linked requirements ({f.type === 'Add' ? 'proposed' : 'approved'} only):</p>
      {eligible.length ? eligible.map((r) => <label key={r.id} className="chk"><input type="checkbox" checked={f.reqs.includes(r.id)} onChange={() => toggle(r.id)} />{r.id} {r.title}</label>) : <span className="muted">None available.</span>}
      {errs.length > 0 && <div className="w c"><ul>{errs.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
      <p><button className="p" onClick={submit}>Submit change request</button></p>
    </div>
  );
}

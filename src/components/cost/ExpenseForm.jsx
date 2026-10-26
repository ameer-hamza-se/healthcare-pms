import { useState } from 'react';
import { CATEGORIES } from '../../../shared/logic.js';

// Validated entry form: activity, date (not after the status date), category, description and amount are required.
export default function ExpenseForm({ p }) {
  const blank = () => ({ date: p.db.charter.statusDate, task: p.db.tasks[0]?.id || '', cat: 'Labor', desc: '', amount: '', ref: '' });
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState([]);
  const upd = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const submit = () => { const e = p.addExpense(f); setErrs(e); if (!e.length) setF(blank()); };
  return (
    <div className="card np">
      <div className="frm">
        <label>Date<input type="date" value={f.date} onChange={(e) => upd('date', e.target.value)} /></label>
        <label>Activity<select value={f.task} onChange={(e) => upd('task', e.target.value)}>{p.db.tasks.map((t) => <option key={t.id} value={t.id}>{t.id} {t.name}</option>)}</select></label>
        <label>Category<select value={f.cat} onChange={(e) => upd('cat', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Amount (PKR)<input type="number" min={0} value={f.amount} onChange={(e) => upd('amount', e.target.value)} /></label>
        <label>Description<input value={f.desc} onChange={(e) => upd('desc', e.target.value)} /></label>
        <label>Invoice / reference<input value={f.ref} onChange={(e) => upd('ref', e.target.value)} /></label>
      </div>
      {errs.length > 0 && <div className="w c"><ul>{errs.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
      <button className="p" onClick={submit}>Record expenditure</button>
    </div>
  );
}

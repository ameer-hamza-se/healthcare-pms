import { useState } from 'react';

export default function DecisionPanel({ p, open, sel, setSel }) {
  const [by, setBy] = useState('');
  const [note, setNote] = useState('');
  if (!open.length) return <p className="muted">No change requests are waiting for a decision.</p>;
  const cr = open.find((x) => x.id === sel);
  const decide = (d) => { if (!p.decide(sel, d, by, note)) setNote(''); };
  return (
    <div className="card np" style={{ marginTop: 10 }}>
      <b>Decision</b>
      <div className="frm">
        <label>Change request
          <select value={sel} onChange={(e) => setSel(e.target.value)}>{open.map((x) => <option key={x.id} value={x.id}>{x.id} {x.title} ({x.status})</option>)}</select>
        </label>
        <label>Decided by (approver)<input value={by} onChange={(e) => setBy(e.target.value)} placeholder="e.g. Project Sponsor" /></label>
      </div>
      <label>Decision note (required to reject)<textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <p>
        {cr?.status === 'Submitted' && <><button className="p s" onClick={() => p.markReview(sel)}>Mark under review</button>{' '}</>}
        <button className="p" onClick={() => decide('Approved')}>Approve</button>{' '}
        <button className="x" onClick={() => decide('Rejected')}>Reject</button>
      </p>
    </div>
  );
}

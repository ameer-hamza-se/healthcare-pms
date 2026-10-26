import { LOCKED, M } from '../../../shared/logic.js';

export default function ScopeBaselines({ p }) {
  const { db, C } = p, locked = LOCKED.includes(db.charter.status);
  return (
    <>
      <div className="tw">
        <table>
          <thead><tr>{['Version', 'Date', 'Description', 'Requirements', 'Items', 'Budget', 'Deadline', 'Change request'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{db.baselines.map((b) => (
            <tr key={b.id}><td>v{b.version}</td><td>{b.date}</td><td>{b.desc}</td><td>{b.reqs.join(', ')}</td><td>{b.reqs.length}</td><td>{M(b.budget)}</td><td>{b.deadline}</td><td>{b.cr || '-'}</td></tr>
          ))}</tbody>
        </table>
      </div>
      {C.unbaselined?.length > 0 && <div className="w c">Scope creep: {C.unbaselined.map((r) => r.id).join(', ')} approved without change control.</div>}
      <p>
        <button className="p" disabled={locked} onClick={p.freezeBaseline}>Freeze scope baseline</button>{' '}
        <span className="muted">{locked ? 'The baseline is under change control: only approved change requests create new versions.' : 'Planning stage: freeze the baseline before moving the project to Execution.'}</span>
      </p>
    </>
  );
}

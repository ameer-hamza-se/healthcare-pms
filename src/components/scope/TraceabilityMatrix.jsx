import { M, sum } from '../../../shared/logic.js';

// Links each requirement to its tasks, cost, quality records and change requests.
export default function TraceabilityMatrix({ p }) {
  const { db, C } = p, spent = C.spent || {}, last = db.baselines[db.baselines.length - 1] || { reqs: [] };
  const rows = db.reqs.map((r) => {
    const ts = db.tasks.filter((t) => t.req === r.id), ch = db.checks.filter((q) => q.req === r.id);
    const flags = [];
    if (r.status === 'Approved' && !ts.length) flags.push('No work package');
    if (r.status === 'Approved' && !last.reqs.includes(r.id)) flags.push('Not in baseline');
    return { r, ts, ch, flags, planned: sum(ts, 'cost'), actual: ts.reduce((s, t) => s + (spent[t.id] || 0), 0),
      defects: db.defects.filter((d) => d.req === r.id && !['Resolved', 'Closed'].includes(d.status)).length,
      crs: db.crs.filter((c) => c.reqs.includes(r.id)).map((c) => c.id).join(', ') };
  });
  return (
    <div className="tw">
      <table>
        <thead><tr>{['Requirement', 'Status', 'Tasks', 'Planned', 'Spent', 'Open defects', 'Checks pass/fail/pending', 'Change requests', 'Flags'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map(({ r, ts, ch, flags, planned, actual, defects, crs }) => (
          <tr key={r.id}>
            <td>{r.id} {r.title}</td><td>{r.status}</td><td>{ts.map((t) => t.id).join(', ') || '-'}</td><td>{M(planned)}</td><td>{M(actual)}</td><td>{defects}</td>
            <td>{ch.filter((q) => q.result === 'Pass').length}/{ch.filter((q) => q.result === 'Fail').length}/{ch.filter((q) => q.result === 'Pending').length}</td>
            <td>{crs || '-'}</td><td className={flags.length ? 'bd' : ''}>{flags.join(', ') || 'OK'}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

import { calc, decideCR, F, M } from '../../../shared/logic.js';

// Shows what the project would look like if the selected change request were approved.
export default function ImpactPreview({ p, id }) {
  const { db, C } = p;
  if (!id || C.err) return null;
  let after, A;
  try { after = decideCR(db, id, 'Approved', 'preview'); A = calc(after); } catch (e) { return <div className="w c">{id} cannot be approved yet: {e.message}</div>; }
  const n = (d) => d.reqs.filter((r) => r.status === 'Approved').length;
  const rows = [
    ['Approved budget', M(C.budget), M(A.budget)], ['Planned cost (BAC)', M(C.E.bac), M(A.E.bac)],
    ['Approved deadline', F(C.dl), F(A.dl)], ['Forecast finish', F(C.fin), F(A.fin)],
    ['Approved requirements', n(db), n(after)], ['Work packages', db.tasks.length, after.tasks.length],
  ];
  return (
    <div style={{ marginTop: 10 }}>
      <b>Impact of approving {id}</b>
      <div className="tw cmp"><table>
        <thead><tr><th>Measure</th><th>Before</th><th>After</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td></tr>)}</tbody>
      </table></div>
    </div>
  );
}

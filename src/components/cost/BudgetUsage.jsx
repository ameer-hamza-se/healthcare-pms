import { M } from '../../../shared/logic.js';

export default function BudgetUsage({ C }) {
  const used = (C.total / C.budget) * 100, cats = Object.entries(C.byCat).sort((a, b) => b[1] - a[1]);
  return (
    <div className="card">
      <div>Spent <b>{M(C.total)}</b> of approved budget <b>{M(C.budget)}</b> ({used.toFixed(1)}%). Remaining {M(C.budget - C.total)}. Forecast at completion (EAC) {M(C.E.eac)}.</div>
      <div className={'meter' + (used > 100 ? ' hot' : '')}><i style={{ width: Math.min(100, used) + '%' }} /></div>
      <div className="tw cmp" style={{ marginTop: 8 }}>
        <table>
          <thead><tr><th>Category</th><th>Spent</th><th>Share</th></tr></thead>
          <tbody>{cats.map(([k, v]) => <tr key={k}><td>{k}</td><td>{M(v)}</td><td>{((v / C.total) * 100).toFixed(1)}%</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

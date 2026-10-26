import { D } from '../../../shared/logic.js';
import DataTable from '../common/DataTable.jsx';

// Planned cost and % complete are edited here; actual cost is read-only because it comes from the ledger.
export default function CostTable({ p }) {
  const { db, C } = p, status = D(db.charter.statusDate);
  const rows = C.tx.map((t) => ({
    ...t,
    var: t.cost - t.actual,
    burn: t.cost ? Math.round((t.actual / t.cost) * 100) + '%' : 'n/a',
    pv: t.cost * Math.min(1, Math.max(0, (status - C.B.S[t.id] + 1) / t.dur)),
    ev: (t.cost * t.pct) / 100,
    flag: t.actual > t.cost ? 'Over plan' : '',
  }));
  const cols = [['id', 'ID', 'ro'], ['name', 'Activity', 'ro'], ['cost', 'Planned cost', 'num'], ['actual', 'Actual (ledger)', 'ro'], ['var', 'Variance', 'ro'], ['burn', 'Spent vs plan', 'ro'],
    ['pct', '% done', 'num'], ['pv', 'PV', 'ro'], ['ev', 'EV', 'ro'], ['flag', 'Flag', 'ro']];
  return <DataTable rows={rows} cols={cols} set={p.set('tasks')} />;
}

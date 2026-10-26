import { CATEGORIES, M, D } from '../../../shared/logic.js';
import DataTable from '../common/DataTable.jsx';

// Actual cost of every activity is the sum of these entries; it cannot be typed in elsewhere.
export default function ExpenseLedger({ p }) {
  const { db } = p, st = D(db.charter.statusDate);
  const cols = [['id', 'ID', 'ro'], ['date', 'Date', 'date'], ['task', 'Activity', 'sel', db.tasks.map((t) => [t.id, t.id + ' ' + t.name])], ['cat', 'Category', 'sel', CATEGORIES],
    ['desc', 'Description', 'text'], ['amount', 'Amount (PKR)', 'num'], ['ref', 'Reference', 'text']];
  const del = (id) => { if (confirm('Delete ledger entry ' + id + '?')) p.del('expenses')(id); };
  const total = db.expenses.filter((e) => D(e.date) <= st).reduce((s, e) => s + e.amount, 0);
  return (
    <>
      <DataTable rows={db.expenses} cols={cols} set={p.set('expenses')} del={del} />
      <p>{db.expenses.length} entries. Ledger total to status date: <b>{M(total)}</b>.</p>
    </>
  );
}

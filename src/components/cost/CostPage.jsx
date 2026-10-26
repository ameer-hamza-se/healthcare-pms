import EvmCards from './EvmCards.jsx';
import BudgetUsage from './BudgetUsage.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import ExpenseLedger from './ExpenseLedger.jsx';
import CostTable from './CostTable.jsx';
import SCurve from './SCurve.jsx';

export default function CostPage({ p }) {
  const { db, C, setThreshold } = p, th = db.th;
  const alerts = C.W.filter((w) => /CPI|SPI|budget|Estimate|planned cost/.test(w[1]));
  return (
    <div>
      <EvmCards E={C.E} th={th} budget={C.budget} />
      {alerts.map((w, i) => <div key={i} className={'w ' + w[0]}>{w[1]}</div>)}
      <p>
        <label style={{ display: 'inline-block' }}>CPI threshold <input style={{ width: 70 }} type="number" step={0.05} value={th.cpi} onChange={(e) => setThreshold('cpi', +e.target.value || 0)} /></label>{' '}
        <label style={{ display: 'inline-block' }}>SPI threshold <input style={{ width: 70 }} type="number" step={0.05} value={th.spi} onChange={(e) => setThreshold('spi', +e.target.value || 0)} /></label>
      </p>
      <h2>Planned value vs actual cost</h2><SCurve db={db} C={C} />
      <h2>Budget usage</h2><BudgetUsage C={C} />
      <h2>Record expenditure</h2><ExpenseForm p={p} />
      <h2>Expenditure ledger</h2><ExpenseLedger p={p} />
      <h2>Activity cost: planned vs actual</h2><CostTable p={p} />
    </div>
  );
}

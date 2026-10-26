import { M } from '../../../shared/logic.js';

// Hierarchical WBS: project > approved requirement (deliverable) > task (work package).
export default function WbsTree({ db }) {
  const reqs = db.reqs.filter((r) => r.status === 'Approved');
  const loose = db.tasks.filter((t) => !reqs.some((r) => r.id === t.req));
  const n = reqs.length + 1;
  return (
    <div className="card">
      <b>1 {db.charter.name}</b>
      {reqs.map((r, i) => (
        <div key={r.id} className="tr">
          <b>1.{i + 1} {r.title}</b>
          {db.tasks.filter((t) => t.req === r.id).map((t, j) => <div key={t.id} className="tr">1.{i + 1}.{j + 1} {t.name} ({M(t.cost)})</div>)}
        </div>
      ))}
      <div className="tr">
        <b>1.{n} Project management and integration</b>
        {loose.map((t, j) => <div key={t.id} className="tr">1.{n}.{j + 1} {t.name} ({M(t.cost)})</div>)}
      </div>
    </div>
  );
}

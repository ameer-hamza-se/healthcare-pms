import Field from '../common/Field.jsx';

const STATUSES = ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closed'];

export default function CharterForm({ p }) {
  const c = p.db.charter, ch = p.ch;
  return (
    <>
      <div className="g2">
        <Field label="Project name" value={c.name} onChange={(v) => ch('name', v)} />
        <Field label="Approved base budget (PKR)" type="number" value={c.budget} onChange={(v) => ch('budget', v)} />
        <Field label="Start date" type="date" value={c.start} onChange={(v) => ch('start', v)} />
        <Field label="Deadline" type="date" value={c.deadline} onChange={(v) => ch('deadline', v)} />
        <Field label="Status date" type="date" value={c.statusDate} onChange={(v) => ch('statusDate', v)} />
        <label>Project status
          <select value={c.status} onChange={(e) => ch('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      </div>
      <div className="g2" style={{ marginTop: 10 }}>
        <Field label="Objectives" type="area" value={c.objectives} onChange={(v) => ch('objectives', v)} />
        <Field label="Stakeholders" type="area" value={c.stakeholders} onChange={(v) => ch('stakeholders', v)} />
        <Field label="In scope" type="area" value={c.inScope} onChange={(v) => ch('inScope', v)} />
        <Field label="Scope boundaries (out of scope)" type="area" value={c.outScope} onChange={(v) => ch('outScope', v)} />
      </div>
    </>
  );
}

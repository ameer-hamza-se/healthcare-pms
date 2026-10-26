import Field from '../common/Field.jsx';

export default function PlanForm({ p }) {
  const plan = p.db.charter.plan;
  return (
    <div className="g2">
      {['scope', 'schedule', 'cost', 'quality'].map((k) => (
        <Field key={k} label={k[0].toUpperCase() + k.slice(1) + ' plan'} type="area" value={plan[k]} onChange={(v) => p.plan(k, v)} />
      ))}
    </div>
  );
}

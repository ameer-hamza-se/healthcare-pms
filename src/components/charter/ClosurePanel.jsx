import Field from '../common/Field.jsx';

export default function ClosurePanel({ p }) {
  const { db, C, ch, say } = p;
  const close = () => {
    if (C.pend?.length || C.crit?.length || p.issues.length) return say('Cannot close: resolve pending change requests, critical defects and validation issues first.');
    ch('status', 'Closed');
    say('Project marked as closed.');
  };
  return (
    <div className="card">
      <Field label="Closure record (lessons learned, acceptance)" type="area" value={db.charter.closure} onChange={(v) => ch('closure', v)} />
      <p><button className="p" onClick={close}>Close project</button></p>
    </div>
  );
}

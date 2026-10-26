import { F } from '../../../shared/logic.js';
import DataTable from '../common/DataTable.jsx';

export default function ActivityTable({ p }) {
  const { db, C } = p;
  const names = db.team.map((m) => m.name);
  const reqOptions = [['', '(none)'], ...db.reqs.filter((r) => r.status === 'Approved').map((r) => [r.id, r.id + ' ' + r.title])];
  const rows = db.tasks.map((t) => ({ ...t, ps: F(C.B.S[t.id]), pe: F(C.B.E[t.id]), fe: F(C.Fc.E[t.id]) }));
  const cols = [['id', 'ID', 'ro'], ['name', 'Activity', 'text'], ['owner', 'Assigned to', 'sel', names], ['req', 'Requirement', 'sel', reqOptions],
    ['dur', 'Days', 'num'], ['dep', 'Depends on', 'ids'], ['ps', 'Start', 'ro'], ['pe', 'End', 'ro'], ['fe', 'Forecast end', 'ro'], ['pct', '% done', 'num']];
  return (
    <>
      <DataTable rows={rows} cols={cols} set={p.set('tasks')} del={p.del('tasks')} />
      <p><button className="p" onClick={() => p.add('tasks', { name: 'New activity', owner: names[0], start: db.charter.start, dur: 5, dep: [], cost: 0, pct: 0, req: '' })}>Add activity</button></p>
    </>
  );
}

import { F } from '../../../shared/logic.js';
import DataTable from '../common/DataTable.jsx';
import ActivityTable from './ActivityTable.jsx';
import DelayImpact from './DelayImpact.jsx';
import GanttChart from './GanttChart.jsx';

export default function SchedulePage({ p }) {
  const { db, C } = p;
  if (C.err) {
    return (
      <div>
        <div className="w c">Schedule error: {C.err}</div>
        <DataTable rows={db.tasks} set={p.set('tasks')} cols={[['id', 'ID', 'ro'], ['name', 'Task', 'ro'], ['dep', 'Depends on', 'ids']]} />
      </div>
    );
  }
  return (
    <div>
      <h2>Activities</h2>
      <ActivityTable p={p} />
      <p>Start dates move automatically when a dependency finishes later. Approved deadline: <b>{F(C.dl)}</b>. Forecast finish: <b className={C.fin > C.dl ? 'bd' : 'ok'}>{F(C.fin)}</b>.</p>
      <h2>Delay impact</h2><DelayImpact C={C} />
      <h2>Gantt timeline</h2><GanttChart db={db} C={C} />
    </div>
  );
}

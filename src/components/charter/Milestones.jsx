import DataTable from '../common/DataTable.jsx';

export default function Milestones({ p }) {
  const cols = [['name', 'Milestone', 'text'], ['date', 'Date', 'date'], ['done', 'Done', 'sel', ['Yes', 'No']]];
  return (
    <div>
      <DataTable rows={p.db.milestones} cols={cols} set={p.set('milestones')} del={p.del('milestones')} />
      <p><button className="p" onClick={() => p.add('milestones', { name: 'New milestone', date: p.db.charter.deadline, done: 'No' })}>Add milestone</button></p>
    </div>
  );
}

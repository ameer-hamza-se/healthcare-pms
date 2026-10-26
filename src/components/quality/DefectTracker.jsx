import DataTable from '../common/DataTable.jsx';

export default function DefectTracker({ p }) {
  const names = p.db.team.map((m) => m.name);
  const reqOptions = [['', '(none)'], ...p.db.reqs.map((r) => [r.id, r.id + ' ' + r.title])];
  const cols = [['id', 'ID', 'ro'], ['title', 'Defect', 'text'], ['mod', 'Module', 'text'], ['sev', 'Severity', 'sel', ['Critical', 'High', 'Medium', 'Low']],
    ['who', 'Assigned to', 'sel', names], ['req', 'Requirement', 'sel', reqOptions], ['status', 'Status', 'sel', ['Open', 'In Progress', 'Resolved', 'Closed']]];
  return (
    <>
      <DataTable rows={p.db.defects} cols={cols} set={p.set('defects')} del={p.del('defects')} />
      <p><button className="p" onClick={() => p.add('defects', { title: 'New defect', mod: '', sev: 'Medium', who: names[names.length - 1], status: 'Open', req: '' })}>Log defect</button></p>
    </>
  );
}

import DataTable from '../common/DataTable.jsx';

export default function RequirementsTable({ p }) {
  const cols = [['id', 'ID', 'ro'], ['title', 'Requirement', 'text'], ['pri', 'Priority', 'sel', ['High', 'Medium', 'Low']], ['status', 'Status', 'sel', ['Proposed', 'Approved', 'Rejected']]];
  return (
    <>
      <DataTable rows={p.db.reqs} cols={cols} set={p.set('reqs')} del={p.del('reqs')} />
      <p><button className="p" onClick={() => p.add('reqs', { title: 'New requirement', pri: 'Medium', status: 'Proposed' })}>Add requirement</button></p>
      <p className="muted">Only Approved requirements are part of the project scope and can have work packages.</p>
    </>
  );
}

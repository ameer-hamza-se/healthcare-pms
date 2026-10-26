import DataTable from '../common/DataTable.jsx';

export default function QualityChecklist({ p }) {
  const checks = p.db.checks, count = (r) => checks.filter((x) => x.result === r).length;
  const reqOptions = [['', '(none)'], ...p.db.reqs.map((r) => [r.id, r.id + ' ' + r.title])];
  const cols = [['id', 'ID', 'ro'], ['deliv', 'Deliverable', 'text'], ['item', 'Check', 'text'], ['req', 'Requirement', 'sel', reqOptions], ['result', 'Result', 'sel', ['Pending', 'Pass', 'Fail']], ['note', 'Notes', 'text']];
  return (
    <>
      <DataTable rows={checks} cols={cols} set={p.set('checks')} del={p.del('checks')} />
      <p><button className="p" onClick={() => p.add('checks', { deliv: '', item: 'New check', result: 'Pending', note: '', req: '' })}>Add check</button></p>
      <p>Inspection: {count('Pass')} passed, {count('Fail')} failed, {count('Pending')} pending.</p>
    </>
  );
}

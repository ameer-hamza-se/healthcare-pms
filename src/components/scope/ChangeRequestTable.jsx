import DataTable from '../common/DataTable.jsx';

const COLS = [['id', 'ID', 'ro'], ['title', 'Change', 'text'], ['type', 'Type', 'ro'], ['by', 'Requested by', 'text'], ['date', 'Submitted', 'ro'], ['why', 'Justification', 'text'],
  ['cost', 'Cost impact (PKR)', 'num'], ['days', 'Schedule impact (days)', 'num'], ['reqs', 'Requirements', 'ids'], ['status', 'Status', 'ro'], ['decidedBy', 'Decided by', 'ro'], ['decidedOn', 'Decision date', 'ro'], ['note', 'Decision note', 'ro']];

export default function ChangeRequestTable({ p }) {
  return <DataTable rows={p.db.crs} cols={COLS} set={p.set('crs')} del={p.del('crs')} />;
}

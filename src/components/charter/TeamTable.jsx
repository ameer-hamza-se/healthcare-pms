import DataTable from '../common/DataTable.jsx';

export default function TeamTable({ p }) {
  return <DataTable rows={p.db.team} set={p.set('team')} cols={[['name', 'Team member', 'text'], ['resp', 'Responsibility', 'text']]} />;
}

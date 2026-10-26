import DataTable from '../common/DataTable.jsx';

export default function RiskRegister({ p, ranked }) {
  const cols = [['id', 'ID', 'ro'], ['desc', 'Risk or issue', 'text'], ['lik', 'Likelihood 1-5', 'num'], ['imp', 'Impact 1-5', 'num'], ['score', 'Score', 'ro'], ['prev', 'Preventive action', 'text'], ['corr', 'Corrective action', 'text']];
  return (
    <>
      <DataTable rows={ranked} cols={cols} set={p.set('risks')} del={p.del('risks')} />
      <p><button className="p" onClick={() => p.add('risks', { desc: 'New risk', lik: 3, imp: 3, prev: '', corr: '' })}>Add risk</button></p>
    </>
  );
}

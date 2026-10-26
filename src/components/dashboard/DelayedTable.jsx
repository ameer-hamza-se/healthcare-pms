export default function DelayedTable({ delayed }) {
  return (
    <div className="tw">
      <table>
        <thead><tr>{['Task', 'Owner', 'Complete', 'Slip (days)', 'Delays'].map((x) => <th key={x}>{x}</th>)}</tr></thead>
        <tbody>
          {delayed.map((t) => (
            <tr key={t.id}><td>{t.id} {t.name}</td><td>{t.owner}</td><td>{t.pct}%</td><td>{t.days}</td><td>{t.imp.join(', ') || 'final deadline only'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

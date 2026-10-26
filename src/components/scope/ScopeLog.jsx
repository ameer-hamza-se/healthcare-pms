// Audit trail of scope decisions (newest first).
export default function ScopeLog({ db }) {
  return (
    <div className="tw">
      <table>
        <thead><tr>{['Date', 'Action', 'Reference', 'Detail', 'By'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{[...db.scopeLog].reverse().map((l) => <tr key={l.id}><td>{l.date}</td><td>{l.action}</td><td>{l.ref}</td><td>{l.detail}</td><td>{l.by}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

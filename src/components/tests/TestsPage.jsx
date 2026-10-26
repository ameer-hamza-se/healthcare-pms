import { useMemo } from 'react';
import { tests } from '../../../shared/logic.js';
import Badge from '../common/Badge.jsx';

export default function TestsPage() {
  const results = useMemo(() => tests(), []);
  const passed = results.filter((r) => r[3]).length;
  return (
    <div>
      <h2>Automated test cases ({passed} of {results.length} pass)</h2>
      <div className="tw">
        <table>
          <thead><tr>{['Test', 'Expected', 'Actual', 'Result'].map((x) => <th key={x}>{x}</th>)}</tr></thead>
          <tbody>
            {results.map((r, i) => <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><Badge tone={r[3] ? 'ok' : 'bad'}>{r[3] ? 'PASS' : 'FAIL'}</Badge></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

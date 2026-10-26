import Icon from './Icon.jsx';

// Lists every broken validation rule. The database is only updated while this list is empty.
export default function ValidationPanel({ issues, compact }) {
  if (!issues.length) return <div className="okbox"><Icon name="shield" /> All data validation rules pass. Changes are saved to the database.</div>;
  const shown = compact ? issues.slice(0, 4) : issues;
  return (
    <div className="w c">
      <b>{issues.length} validation issue(s). Changes are not saved to the database until these are fixed.</b>
      <ul>{shown.map((m, i) => <li key={i}>{m}</li>)}{compact && issues.length > 4 && <li>and {issues.length - 4} more (see Dashboard)</li>}</ul>
    </div>
  );
}

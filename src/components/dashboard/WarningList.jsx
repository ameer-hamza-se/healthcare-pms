import Icon from '../common/Icon.jsx';

// warnings = [['c' | 'w', text], ...]  (c = critical, w = warning)
export default function WarningList({ warnings }) {
  if (!warnings.length) return <div className="okbox"><Icon name="shield" /> All indicators are within thresholds.</div>;
  return warnings.map((w, i) => <div key={i} className={'w ' + w[0]}>{w[1]}</div>);
}

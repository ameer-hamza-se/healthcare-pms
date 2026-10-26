import { M, f2 } from '../../../shared/logic.js';
import Icon from '../common/Icon.jsx';

// Index gauge: the marker shows the value on a 0-1.5 scale, the dashed line is the alert threshold.
function Gauge({ label, hint, value, threshold }) {
  const pos = (v) => Math.min(100, Math.max(0, (v / 1.5) * 100)) + '%';
  const bad = value != null && value < threshold;
  return (
    <div className={'card gauge ' + (bad ? 'tone-bad' : 'tone-ok')}>
      <div className="gauge-h"><span>{label}</span><b>{f2(value)}</b></div>
      <div className="gauge-bar"><i style={{ left: pos(value ?? 0) }} /><u style={{ left: pos(threshold) }} title={'Threshold ' + threshold} /></div>
      <div className="kpi-s">{hint} · threshold {threshold} · {bad ? 'below threshold' : 'on track'}</div>
    </div>
  );
}

export default function EvmCards({ E, th, budget }) {
  const kpi = (icon, label, value, tone = 'info') => (
    <div className={'kpi tone-' + tone}><span className="kpi-ico"><Icon name={icon} size={20} /></span><div><div className="kpi-v">{value}</div><div className="kpi-l">{label}</div></div></div>
  );
  return (
    <div className="kpis">
      {kpi('calendar', 'Planned Value (PV)', M(E.pv))}
      {kpi('trend', 'Earned Value (EV)', M(E.ev))}
      {kpi('coins', 'Actual Cost (AC)', M(E.ac), 'warn')}
      <Gauge label="Cost Performance Index (CPI)" hint="EV / AC" value={E.cpi} threshold={th.cpi} />
      <Gauge label="Schedule Performance Index (SPI)" hint="EV / PV" value={E.spi} threshold={th.spi} />
      {kpi('target', 'Estimate at completion (BAC / CPI)', M(E.eac), E.eac > budget ? 'bad' : 'ok')}
    </div>
  );
}

import { M, F } from '../../../shared/logic.js';
import Icon from '../common/Icon.jsx';

export default function KpiCards({ C, issues }) {
  const progress = C.E.bac ? Math.round((C.E.ev / C.E.bac) * 100) : 0;
  const cards = [
    { icon: 'trend', label: 'Overall progress (EV / BAC)', value: progress + '%', tone: 'info', bar: progress },
    { icon: 'changes', label: 'Pending change requests', value: C.pend.length, tone: C.pend.length ? 'warn' : 'ok' },
    { icon: 'clock', label: 'Delayed activities', value: C.delayed.length, tone: C.delayed.length ? 'bad' : 'ok' },
    { icon: 'coins', label: 'Spent of approved budget', value: M(C.total), sub: 'Budget ' + M(C.budget), tone: C.total > C.budget ? 'bad' : C.E.eac > C.budget ? 'warn' : 'ok', bar: Math.min(100, (C.total / C.budget) * 100) },
    { icon: 'bug', label: 'Unresolved critical defects', value: C.crit.length, tone: C.crit.length ? 'bad' : 'ok' },
    { icon: 'target', label: 'Forecast finish', value: F(C.fin), sub: 'Deadline ' + F(C.dl), tone: C.fin > C.dl ? 'bad' : 'ok' },
    { icon: 'shield', label: 'Data validation issues', value: issues, tone: issues ? 'bad' : 'ok' },
  ];
  return (
    <div className="kpis">
      {cards.map((c) => (
        <div className={'kpi tone-' + c.tone} key={c.label}>
          <span className="kpi-ico"><Icon name={c.icon} size={20} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kpi-v">{c.value}</div>
            <div className="kpi-l">{c.label}</div>
            {c.sub && <div className="kpi-s">{c.sub}</div>}
            {c.bar != null && <div className="minibar"><i style={{ width: c.bar + '%' }} /></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

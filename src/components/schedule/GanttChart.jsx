import { D, F } from '../../../shared/logic.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Gantt-style timeline built from baseline (C.B) and forecast (C.Fc) schedules.
export default function GanttChart({ db, C }) {
  const { tasks, milestones } = db, { B, Fc } = C, status = D(db.charter.statusDate);
  const lo = Math.min(...tasks.map((t) => B.S[t.id]));
  const hi = Math.max(C.fin, C.dl, ...milestones.map((m) => D(m.date)));
  const w = hi - lo + 1;
  const pos = (x) => ((x - lo) / w) * 100 + '%', len = (n) => (n / w) * 100 + '%';
  const s0 = new Date(lo * 864e5), months = [];
  for (let k = 0; ; k++) { const dd = Date.UTC(s0.getUTCFullYear(), s0.getUTCMonth() + k, 1) / 864e5; if (dd > hi) break; if (dd >= lo) months.push(dd); }
  const track = (children) => (
    <div className="gb">{children}<u className="st" style={{ left: pos(status) }} /><u className="dl" style={{ left: pos(C.dl) }} /></div>
  );
  return (
    <div className="card gt">
      <div className="gr gh">
        <span className="gl">Activity</span>
        <div className="gb">{months.map((m) => <span key={m} className="tick" style={{ left: pos(m) }}>{MONTHS[new Date(m * 864e5).getUTCMonth()]}</span>)}</div>
      </div>
      <div className="gr">
        <span className="gl"><b>Milestones</b></span>
        <div className="gb">
          {milestones.map((m) => <span key={m.id} className="ms" title={`${m.name} ${m.date}`} style={{ left: pos(D(m.date)) }}>{m.done === 'Yes' ? '◆' : '◇'}</span>)}
        </div>
      </div>
      {tasks.map((t) => {
        const slip = Fc.E[t.id] > B.E[t.id];
        return (
          <div className="gr" key={t.id}>
            <span className="gl" title={t.name}>{t.id} {t.name}</span>
            {track(<>
              <i className={'bar' + (t.pct === 100 ? ' done' : '') + (slip ? ' slip' : '')} style={{ left: pos(B.S[t.id]), width: len(t.dur) }} title={`${F(B.S[t.id])} to ${F(B.E[t.id])} · ${t.pct}% complete`}><b style={{ width: t.pct + '%' }} /></i>
              {slip && <i className="late" style={{ left: pos(B.E[t.id] + 1), width: len(Fc.E[t.id] - B.E[t.id]) }} title={`Forecast end ${F(Fc.E[t.id])}`} />}
            </>)}
          </div>
        );
      })}
      <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>Fill = progress (green when complete). Red outline and hatching = forecast slip. Amber line = status date. Red line = approved deadline. ◆ done milestone, ◇ upcoming. Timeline {F(lo)} to {F(hi)}.</p>
    </div>
  );
}

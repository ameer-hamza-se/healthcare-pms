import Icon from '../common/Icon.jsx';

// counts = { tabName: [number, 'hard' | 'soft'] } shows alert bubbles (pending changes, critical defects, issues).
export default function Sidebar({ tabs, tab, setTab, counts, p }) {
  const c = p.db.charter;
  return (
    <aside className="side">
      <div className="brand">
        <span className="brand-ico"><Icon name="cross" size={22} /></span>
        <span><b>SmartCare PMS</b><small>Healthcare project control</small></span>
      </div>
      <div className="nav-label">Project</div>
      {tabs.map((t) => {
        const n = counts[t.name];
        return (
          <button key={t.name} className={'navitem' + (tab === t.name ? ' on' : '')} onClick={() => setTab(t.name)}>
            <Icon name={t.icon} /><span>{t.name}</span>
            {n && n[0] > 0 && <span className={'count' + (n[1] === 'soft' ? ' soft' : '')}>{n[0]}</span>}
          </button>
        );
      })}
      <div className="side-foot">
        <div>Stage: <b>{c.status}</b></div>
        <div>Status date: <b>{c.statusDate}</b></div>
        <div>Scope baseline: <b>v{p.db.baselines.length}</b></div>
      </div>
    </aside>
  );
}

import { M, F } from '../../../shared/logic.js';
import Icon from '../common/Icon.jsx';

export default function Topbar({ p, theme, toggleTheme }) {
  const { db, C, source, issues } = p, c = db.charter, onDb = source === 'SQLite database';
  return (
    <header className="topbar">
      <span className="pn">{c.name}</span>
      <span className="chip">Budget <b>{M(C.budget || c.budget)}</b></span>
      <span className="chip">Deadline <b>{C.dl ? F(C.dl) : c.deadline}</b></span>
      <span className="spacer" />
      <span className={'chip ' + (onDb ? 'tone-ok' : 'tone-warn')}><Icon name="database" size={14} /><b>{onDb ? 'SQLite connected' : 'Browser storage only'}</b></span>
      <span className={'chip ' + (issues.length ? 'tone-bad' : 'tone-ok')}><Icon name={issues.length ? 'alert' : 'shield'} size={14} /><b>{issues.length ? issues.length + ' validation issue(s)' : 'Data valid'}</b></span>
      <button className="icon-btn" onClick={toggleTheme} title="Toggle light/dark theme" aria-label="Toggle theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
    </header>
  );
}

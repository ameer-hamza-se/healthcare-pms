import { useState, useEffect } from 'react';
import useProject from './hooks/useProject.js';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import PageHeader from './components/layout/PageHeader.jsx';
import Toast from './components/common/Toast.jsx';
import ValidationPanel from './components/common/ValidationPanel.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import CharterPage from './components/charter/CharterPage.jsx';
import ScopePage from './components/scope/ScopePage.jsx';
import SchedulePage from './components/schedule/SchedulePage.jsx';
import CostPage from './components/cost/CostPage.jsx';
import QualityPage from './components/quality/QualityPage.jsx';
import RiskPage from './components/risk/RiskPage.jsx';
import TestsPage from './components/tests/TestsPage.jsx';

// name, icon, page title, subtitle, component
const TABS = [
  ['Dashboard', 'grid', 'Project dashboard', 'Progress, budget, delays and warnings at a glance', Dashboard],
  ['Charter and plan', 'file', 'Charter and management plan', 'Objectives, stakeholders, plan, milestones, responsibilities and closure', CharterPage],
  ['Scope', 'layers', 'Scope and change control', 'Requirements, change requests, baselines, traceability and WBS', ScopePage],
  ['Schedule', 'calendar', 'Schedule and resources', 'Activities, dependencies, delay impact and Gantt timeline', SchedulePage],
  ['Cost and EVM', 'coins', 'Cost and earned value', 'Expenditure ledger, budget usage and performance indices', CostPage],
  ['Quality', 'check', 'Quality management', 'Defect tracking and inspection checklist', QualityPage],
  ['Risk', 'alert', 'Risk control', 'Prioritization matrix and Process Decision Program Chart', RiskPage],
  ['Tests', 'flask', 'Test cases', 'Automated tests with expected and actual results', TestsPage],
];
// These pages stay usable when the schedule has an error (so the user can fix it).
const SAFE_WHEN_ERROR = ['Charter and plan', 'Scope', 'Schedule'];

export default function App() {
  const p = useProject();
  const [tab, setTab] = useState('Dashboard');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('spms-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('spms-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const [, , title, sub, Page] = TABS.find((t) => t[0] === tab);
  const counts = { Dashboard: [p.issues.length, 'hard'], Scope: [p.C.pend?.length || 0, 'soft'], Quality: [p.C.crit?.length || 0, 'hard'] };
  return (
    <div className="app">
      <Sidebar tabs={TABS.map((t) => ({ name: t[0], icon: t[1] }))} tab={tab} setTab={setTab} counts={counts} p={p} />
      <div className="content">
        <Topbar p={p} theme={theme} toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        <main>
          <Toast msg={p.msg} />
          <PageHeader title={title} sub={sub} />
          {p.issues.length > 0 && tab !== 'Dashboard' && <ValidationPanel issues={p.issues} compact />}
          {p.C.err && !SAFE_WHEN_ERROR.includes(tab)
            ? <div className="w c">Schedule error: {p.C.err}. Fix the dependencies on the Schedule tab.</div>
            : <Page p={p} />}
        </main>
      </div>
    </div>
  );
}

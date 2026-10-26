// Core project-management logic: scheduling, EVM, expenditure ledger, scope/change control,
// validation and unit tests. ES module shared by the React app (src/) and Node (server/, tests/).

// ---------- helpers ----------
export const D = (s) => Math.round(Date.parse(s + 'T00:00:00Z') / 864e5);          // 'YYYY-MM-DD' -> day number
export const F = (n) => new Date(n * 864e5).toISOString().slice(0, 10);            // day number -> 'YYYY-MM-DD'
export const M = (n) => 'PKR ' + Math.round(n).toLocaleString('en-US');
export const sum = (a, k) => a.reduce((s, x) => s + (+x[k] || 0), 0);
export const f2 = (x) => (x == null ? 'n/a' : x.toFixed(2));
export const CATEGORIES = ['Labor', 'Software and licences', 'Infrastructure', 'Testing', 'Other'];
export const OPEN_CR = ['Submitted', 'Under Review'];
export const LOCKED = ['Execution', 'Monitoring', 'Closed'];   // scope is baselined in these project states
export const PREFIX = { reqs: 'R', tasks: 'T', crs: 'CR', expenses: 'E', defects: 'D', checks: 'Q', risks: 'K', milestones: 'MS', team: 'M' };
export const nextId = (list, p) => p + (Math.max(0, ...list.map((x) => { const m = String(x.id).match(new RegExp('^' + p + '(\\d+)$')); return m ? +m[1] : 0; })) + 1);
export const num = (k, v) => {
  v = Math.max(0, +v || 0);
  return k === 'pct' ? Math.min(100, v) : k === 'dur' ? Math.max(1, v) : k === 'lik' || k === 'imp' ? Math.min(5, Math.max(1, v)) : v;
};
export const logEntry = (db, action, ref, detail, by) => [...db.scopeLog, { id: nextId(db.scopeLog, 'L'), date: db.charter.statusDate, action, ref, detail, by: by || 'Project Manager' }];
export const T = (id, name, owner, start, dur, dep, cost, actual, pct, req) => ({ id, name, owner, start, dur, dep, cost, actual, pct, req });

// ---------- sample data (healthcare case study) ----------
export function seed() {
  const planned = [
    T('T1', 'Requirements analysis', 'Project Manager', '2026-07-06', 14, [], 300000, 320000, 100, ''),
    T('T2', 'Database design', 'Database Dev', '2026-07-06', 14, ['T1'], 350000, 380000, 100, ''),
    T('T3', 'Appointment module', 'Backend Dev 1', '2026-07-06', 28, ['T2'], 700000, 820000, 85, 'R1'),
    T('T4', 'Doctor schedule module', 'Backend Dev 2', '2026-07-06', 21, ['T2'], 500000, 540000, 100, 'R3'),
    T('T5', 'Lab report module', 'Backend Dev 2', '2026-07-06', 21, ['T2'], 500000, 520000, 100, 'R2'),
    T('T6', 'Online consultation module', 'Backend Dev 2', '2026-07-06', 28, ['T3'], 650000, 150000, 20, 'R4'),
    T('T7', 'Billing module', 'Backend Dev 1', '2026-07-06', 21, ['T3'], 500000, 60000, 10, 'R5'),
    T('T8', 'Frontend UI', 'Frontend Dev 1', '2026-07-06', 42, ['T2'], 700000, 650000, 90, 'R1'),
    T('T9', 'Integration', 'Frontend Dev 2', '2026-07-06', 14, ['T3', 'T4', 'T5', 'T7', 'T8'], 300000, 0, 0, ''),
    T('T10', 'QA testing', 'QA Engineer', '2026-07-06', 14, ['T9', 'T6'], 350000, 0, 0, ''),
    T('T11', 'Deployment and training', 'Project Manager', '2026-07-06', 7, ['T10'], 150000, 0, 0, ''),
  ];
  const statusDate = '2026-09-14', st = D(statusDate), B = run(planned, null), expenses = [];
  let n = 0;
  planned.forEach((t) => {            // turn each task's spend-to-date into two dated ledger entries
    if (!t.actual) return;
    const a = Math.round(t.actual * 0.7), mid = Math.min(B.S[t.id] + Math.floor(t.dur / 2), st), end = Math.min(B.E[t.id], st);
    expenses.push({ id: 'E' + ++n, date: F(mid), task: t.id, cat: 'Labor', desc: 'Team effort: ' + t.name, amount: a, ref: 'PAY-' + n });
    expenses.push({ id: 'E' + ++n, date: F(end), task: t.id, cat: 'Infrastructure', desc: 'Environments and tools: ' + t.name, amount: t.actual - a, ref: 'INV-' + n });
  });
  return {
    charter: {
      name: 'Smart Healthcare Project Management System',
      objectives: 'Deliver appointments, lab reports, doctor schedules, online consultations and billing for five hospitals within 16 weeks.',
      stakeholders: 'Hospital management (sponsor), doctors, patients, lab staff, finance department',
      inScope: 'Appointments, lab reports, doctor schedules, online consultations, billing', outScope: 'Hardware procurement, hospital network upgrades',
      budget: 5000000, start: '2026-07-06', deadline: '2026-10-25', status: 'Execution', statusDate, closure: '',
      plan: { scope: 'Only approved requirements (R1-R5) are in scope; changes go through change control.', schedule: '16 weeks, 11 work packages, finish-to-start dependencies.', cost: 'Budget PKR 5,000,000; expenditure recorded in the ledger; EVM reviewed weekly (CPI/SPI threshold 0.90).', quality: 'Every deliverable inspected against the checklist; critical defects block release.' },
    },
    th: { cpi: 0.9, spi: 0.9 },
    team: [['Project Manager', 'Planning, control, reporting'], ['Backend Dev 1', 'Appointments, billing'], ['Backend Dev 2', 'Labs, consultations'], ['Frontend Dev 1', 'Patient UI'], ['Frontend Dev 2', 'Doctor/admin UI'], ['Database Dev', 'Schema, queries'], ['QA Engineer', 'Testing, defects']].map((x, i) => ({ id: 'M' + (i + 1), name: x[0], resp: x[1] })),
    milestones: [['Requirements baseline', '2026-07-19'], ['Core modules complete', '2026-08-30'], ['Integration complete', '2026-10-04'], ['Go-live', '2026-10-25']].map((x, i) => ({ id: 'MS' + (i + 1), name: x[0], date: x[1], done: i < 1 ? 'Yes' : 'No' })),
    reqs: [['Appointment management', 'High', 'Approved'], ['Laboratory reports', 'High', 'Approved'], ['Doctor schedules', 'High', 'Approved'], ['Online consultations', 'Medium', 'Approved'], ['Hospital billing', 'High', 'Approved'], ['AI-based preliminary diagnosis', 'High', 'Proposed'], ['Mobile application', 'Medium', 'Proposed']].map((x, i) => ({ id: 'R' + (i + 1), title: x[0], pri: x[1], status: x[2] })),
    crs: [{ id: 'CR1', title: 'Add AI diagnosis module and mobile app', type: 'Add', by: 'Hospital management', date: '2026-08-24', why: 'Hospital management requested an AI-based preliminary diagnosis module and a mobile application during development.', cost: 800000, days: 21, reqs: ['R6', 'R7'], status: 'Submitted', decidedOn: '', decidedBy: '', note: '' }],
    baselines: [{ id: 'B1', version: 1, date: '2026-07-06', desc: 'Initial approved scope', reqs: ['R1', 'R2', 'R3', 'R4', 'R5'], budget: 5000000, deadline: '2026-10-25', cr: '' }],
    scopeLog: [{ id: 'L1', date: '2026-07-06', action: 'Baseline created', ref: 'B1', detail: 'Initial scope R1 to R5, budget PKR 5,000,000', by: 'Project Manager' }, { id: 'L2', date: '2026-08-24', action: 'Change submitted', ref: 'CR1', detail: 'AI diagnosis and mobile app requested', by: 'Hospital management' }],
    tasks: planned.map(({ actual, ...t }) => t),
    expenses,
    defects: [['Overlapping appointment slots accepted', 'Appointments', 'Critical', 'Backend Dev 1', 'Open', 'R1'], ['Duplicate patient records created', 'Patient records', 'Critical', 'Backend Dev 2', 'In Progress', 'R1'], ['Lab report date format wrong', 'Lab reports', 'Low', 'Frontend Dev 2', 'Resolved', 'R2']].map((x, i) => ({ id: 'D' + (i + 1), title: x[0], mod: x[1], sev: x[2], who: x[3], status: x[4], req: x[5] })),
    checks: [['Appointments', 'Prevents double booking', 'Fail', 'R1'], ['Appointments', 'Sends confirmation', 'Pass', 'R1'], ['Lab reports', 'Results linked to patient', 'Pass', 'R2'], ['Billing', 'Totals match services', 'Pending', 'R5'], ['Patient records', 'No duplicate IDs', 'Fail', 'R1']].map((x, i) => ({ id: 'Q' + (i + 1), deliv: x[0], item: x[1], result: x[2], req: x[3], note: '' })),
    risks: [['Scope creep from new hospital requests', 5, 4, 'Enforce change control', 'Re-baseline schedule and budget'], ['Critical defects delay release', 4, 5, 'Early QA and code reviews', 'Add developer capacity to fixes'], ['Backend developer unavailable', 2, 4, 'Cross-train team', 'Reassign to other backend dev'], ['Hospital data migration errors', 3, 4, 'Dry-run migrations', 'Roll back and re-import']].map((x, i) => ({ id: 'K' + (i + 1), desc: x[0], lik: x[1], imp: x[2], prev: x[3], corr: x[4] })),
  };
}

// ---------- scheduling ----------
// Forward pass. bE = baseline end dates (null for the baseline run); st = status date (day number).
// Forecast run: an unfinished task whose baseline end is already past finishes after the status date.
export function run(tasks, bE, st) {
  const m = {}, S = {}, E = {}, V = {};
  tasks.forEach((t) => (m[t.id] = t));
  const go = (t) => {
    if (E[t.id] != null) return;
    if (V[t.id]) throw new Error('Circular dependency involving ' + t.id);
    V[t.id] = 1;
    let s = D(t.start);
    t.dep.forEach((i) => { const p = m[i]; if (p) { go(p); s = Math.max(s, E[p.id] + 1); } });
    let e = s + t.dur - 1;
    if (bE && t.pct < 100 && bE[t.id] < st) e = Math.max(e, st + Math.ceil(t.dur * (1 - t.pct / 100)));
    S[t.id] = s; E[t.id] = e;
  };
  tasks.forEach(go);
  return { S, E };
}

// ---------- earned value ----------
export function evm(tasks, B, st) {
  let pv = 0, e = 0, ac = 0, bac = 0;
  tasks.forEach((t) => {
    bac += t.cost;
    pv += t.cost * Math.min(1, Math.max(0, (st - B.S[t.id] + 1) / t.dur));
    e += (t.cost * t.pct) / 100;
    ac += t.actual;
  });
  const cpi = ac ? e / ac : null, spi = pv ? e / pv : null;
  return { bac, pv, ev: e, ac, cpi, spi, cv: e - ac, sv: e - pv, eac: cpi ? bac / cpi : bac };
}

// ---------- project-wide calculation ----------
export function calc(db) {
  const c = db.charter, st = D(c.statusDate), ap = db.crs.filter((x) => x.status === 'Approved');
  // Actual cost comes only from the expenditure ledger (entries up to the status date).
  const spent = {}, byCat = {};
  let total = 0;
  db.expenses.filter((e) => D(e.date) <= st).forEach((e) => { spent[e.task] = (spent[e.task] || 0) + e.amount; byCat[e.cat] = (byCat[e.cat] || 0) + e.amount; total += e.amount; });
  const tx = db.tasks.map((t) => ({ ...t, actual: spent[t.id] || 0 }));
  const B = run(tx, null), Fc = run(tx, B.E, st), E = evm(tx, B, st);
  const budget = +c.budget + sum(ap, 'cost'), dl = D(c.deadline) + sum(ap, 'days'), fin = Math.max(...tx.map((t) => Fc.E[t.id]));
  const delayed = tx.filter((t) => t.pct < 100 && B.E[t.id] < st).map((t) => ({ ...t, days: Fc.E[t.id] - B.E[t.id], imp: tx.filter((u) => u.dep.includes(t.id)).map((u) => u.id) }));
  const impacted = tx.filter((t) => Fc.S[t.id] > B.S[t.id]).map((t) => t.id);
  const crit = db.defects.filter((d) => d.sev === 'Critical' && !['Resolved', 'Closed'].includes(d.status));
  const over = tx.filter((t) => t.actual > t.cost);
  const last = db.baselines[db.baselines.length - 1] || { reqs: [] };
  const unbaselined = db.reqs.filter((r) => r.status === 'Approved' && !last.reqs.includes(r.id));
  const untraced = db.reqs.filter((r) => r.status === 'Approved' && !db.tasks.some((t) => t.req === r.id));
  const pend = db.crs.filter((x) => OPEN_CR.includes(x.status));
  const W = [];
  if (E.cpi != null && E.cpi < db.th.cpi) W.push(['c', 'Cost overrun: CPI ' + f2(E.cpi) + ' is below threshold ' + db.th.cpi]);
  if (E.spi != null && E.spi < db.th.spi) W.push(['c', 'Schedule deviation: SPI ' + f2(E.spi) + ' is below threshold ' + db.th.spi]);
  if (fin > dl) W.push(['c', 'Forecast finish ' + F(fin) + ' is ' + (fin - dl) + ' days after approved deadline ' + F(dl)]);
  if (E.bac > budget) W.push(['c', 'Planned cost ' + M(E.bac) + ' exceeds approved budget ' + M(budget)]);
  if (total > budget) W.push(['c', 'Recorded expenditure ' + M(total) + ' exceeds approved budget']);
  else if (E.eac > budget) W.push(['w', 'Estimate at completion ' + M(E.eac) + ' exceeds approved budget']);
  if (over.length) W.push(['w', over.length + ' activit' + (over.length > 1 ? 'ies are' : 'y is') + ' over planned cost: ' + over.map((t) => t.id).join(', ')]);
  if (unbaselined.length) W.push(['c', 'Scope creep: ' + unbaselined.map((r) => r.id).join(', ') + ' approved without change control']);
  if (untraced.length) W.push(['w', 'Approved requirement(s) without a work package: ' + untraced.map((r) => r.id).join(', ')]);
  if (crit.length) W.push(['c', crit.length + ' unresolved critical defect(s)']);
  if (pend.length) W.push(['w', pend.length + ' change request(s) awaiting decision']);
  return { B, Fc, E, tx, spent, byCat, total, over, budget, dl, fin, delayed, impacted, crit, W, pend, unbaselined, untraced };
}

// ---------- change control ----------
export function crErrors(s, x) {
  const E = [], id = x.id || 'Change request', open = OPEN_CR.includes(x.status);
  if (!String(x.title || '').trim()) E.push(id + ': title is required.');
  if (!String(x.by || '').trim()) E.push(id + ': requester is required.');
  if (!String(x.why || '').trim()) E.push(id + ': justification is required.');
  if (!['Add', 'Modify'].includes(x.type)) E.push(id + ': type must be Add or Modify.');
  if (!['Submitted', 'Under Review', 'Approved', 'Rejected'].includes(x.status)) E.push(id + ': invalid status.');
  if (!(x.cost >= 0)) E.push(id + ': cost impact must be zero or more.');
  if (!(Number.isInteger(+x.days) && x.days >= 0)) E.push(id + ': schedule impact must be a whole number of days (zero or more).');
  if (!x.reqs.length) E.push(id + ': link at least one requirement.');
  x.reqs.forEach((r) => {
    const q = s.reqs.find((y) => y.id === r);
    if (!q) return E.push(id + ': unknown requirement ' + r + '.');
    if (open && x.type === 'Add' && q.status !== 'Proposed') E.push(id + ': ' + r + ' must be a Proposed requirement for an Add change.');
    if (open && x.type === 'Modify' && q.status !== 'Approved') E.push(id + ': ' + r + ' must be an Approved requirement for a Modify change.');
    if (x.status === 'Approved' && q.status !== 'Approved') E.push(id + ': approved change has unapproved requirement ' + r + '.');
  });
  if (x.status === 'Approved' && !String(x.decidedBy || '').trim()) E.push(id + ': approver is required.');
  if (x.status === 'Rejected' && !String(x.note || '').trim()) E.push(id + ': rejection reason is required.');
  return E;
}

// Approve or reject a change request. Approval updates budget, deadline, scope, work packages,
// creates a new scope baseline and writes the change log. Throws Error with a clear message.
export function decideCR(db, id, decision, by, note = '', date = db.charter.statusDate) {
  const cr = db.crs.find((x) => x.id === id);
  if (!cr) throw new Error('Change request not found');
  if (!OPEN_CR.includes(cr.status)) throw new Error('Only submitted or under-review change requests can be decided');
  if (!String(by || '').trim()) throw new Error('Enter the name of the person making the decision');
  const stamp = { status: decision, decidedOn: date, decidedBy: by.trim(), note: String(note || '').trim() };
  if (decision === 'Rejected') {
    if (!stamp.note) throw new Error('A reason is required to reject a change request');
    return { ...db, crs: db.crs.map((x) => (x.id === id ? { ...x, ...stamp } : x)),
      reqs: cr.type === 'Add' ? db.reqs.map((r) => (cr.reqs.includes(r.id) && r.status === 'Proposed' ? { ...r, status: 'Rejected' } : r)) : db.reqs,
      scopeLog: logEntry(db, 'Change rejected', id, stamp.note, stamp.decidedBy) };
  }
  const errs = crErrors(db, cr);
  if (errs.length) throw new Error(errs[0]);
  const n = cr.reqs.length, owner = (db.team.find((m) => /backend/i.test(m.name)) || db.team[0]).name;
  const integ = db.tasks.find((t) => /integration/i.test(t.name)), qa = db.tasks.find((t) => /qa/i.test(t.name));
  let tasks = [...db.tasks]; const added = [];
  cr.reqs.forEach((r) => {      // one new work package per linked requirement
    const q = db.reqs.find((y) => y.id === r);
    const t = { id: nextId(tasks, 'T'), name: (cr.type === 'Add' ? 'Implement ' : 'Rework ') + q.title, owner, start: db.charter.start, dur: Math.max(1, Math.ceil(cr.days / n)), dep: integ ? [integ.id] : [], cost: cr.cost / n, pct: 0, req: r };
    tasks.push(t); added.push(t.id);
  });
  if (qa) tasks = tasks.map((t) => (t.id === qa.id ? { ...t, dep: [...t.dep, ...added] } : t));
  const crs = db.crs.map((x) => (x.id === id ? { ...x, ...stamp } : x)), ap = crs.filter((x) => x.status === 'Approved');
  const reqs = db.reqs.map((r) => (cr.reqs.includes(r.id) ? { ...r, status: 'Approved' } : r));
  const ver = db.baselines.length + 1, next = { ...db, crs, reqs, tasks };
  return { ...next,
    baselines: [...db.baselines, { id: 'B' + ver, version: ver, date, desc: 'After ' + id + ': ' + cr.title, reqs: reqs.filter((r) => r.status === 'Approved').map((r) => r.id), budget: db.charter.budget + sum(ap, 'cost'), deadline: F(D(db.charter.deadline) + sum(ap, 'days')), cr: id }],
    scopeLog: logEntry(next, 'Change approved', id, 'Budget +' + cr.cost + ', schedule +' + cr.days + ' days, baseline v' + ver, stamp.decidedBy) };
}
export const applyCR = (db, id, by = 'Project Sponsor') => decideCR(db, id, 'Approved', by);

// ---------- expenditure ----------
export function expenseErrors(s, e) {
  const E = [], c = s.charter, id = e.id || 'Expenditure';
  if (!s.tasks.some((t) => t.id === e.task)) E.push(id + ': choose an existing activity.');
  if (!(e.amount > 0)) E.push(id + ': amount must be greater than zero.');
  if (isNaN(D(e.date))) E.push(id + ': enter a valid date.');
  else {
    if (D(e.date) < D(c.start)) E.push(id + ': date is before the project start (' + c.start + ').');
    if (D(e.date) > D(c.statusDate)) E.push(id + ': expenditure cannot be dated after the status date (' + c.statusDate + ').');
  }
  if (!CATEGORIES.includes(e.cat)) E.push(id + ': choose a valid category.');
  if (!String(e.desc || '').trim()) E.push(id + ': description is required.');
  return E;
}

// ---------- validation (used by the browser before saving and by the server on every save) ----------
export function validateState(s) {
  const E = [], c = s.charter || {}, reqs = s.reqs || [], tasks = s.tasks || [], crs = s.crs || [], bl = s.baselines || [], teamRows = s.team || [], team = teamRows.map((m) => m.name);
  const dup = (list, label) => { const seen = new Set(); list.forEach((x) => { if (seen.has(x.id)) E.push('Duplicate ' + label + ' ID ' + x.id + '.'); seen.add(x.id); }); };
  [[reqs, 'requirement'], [tasks, 'task'], [crs, 'change request'], [s.expenses || [], 'expenditure'], [s.defects || [], 'defect'], [s.checks || [], 'quality check'], [s.risks || [], 'risk'], [s.milestones || [], 'milestone'], [teamRows, 'team member']].forEach((a) => dup(...a));
  if (!String(c.name || '').trim()) E.push('Project name is required.');
  if (!(c.budget > 0)) E.push('Approved budget must be greater than zero.');
  if ([c.start, c.deadline, c.statusDate].some((x) => isNaN(D(x)))) E.push('Charter dates must be valid.');
  else {
    if (D(c.deadline) < D(c.start)) E.push('Deadline cannot be before the start date.');
    if (D(c.statusDate) < D(c.start)) E.push('Status date cannot be before the start date.');
  }
  if (!(s.th && s.th.cpi > 0 && s.th.spi > 0)) E.push('CPI and SPI thresholds must be greater than zero.');
  teamRows.forEach((m) => { if (!String(m.name || '').trim()) E.push(m.id + ': team member name is required.'); });
  if (new Set(team).size !== team.length) E.push('Team member names must be unique.');
  (s.milestones || []).forEach((m) => { if (!String(m.name || '').trim() || isNaN(D(m.date))) E.push(m.id + ': milestone needs a name and a valid date.'); });
  reqs.forEach((r) => { if (!String(r.title || '').trim()) E.push(r.id + ': requirement title is required.'); });
  tasks.forEach((t) => {
    if (!String(t.name || '').trim()) E.push(t.id + ': activity name is required.');
    if (!(t.dur >= 1)) E.push(t.id + ': duration must be at least 1 day.');
    if (!(t.cost >= 0)) E.push(t.id + ': planned cost cannot be negative.');
    if (!(t.pct >= 0 && t.pct <= 100)) E.push(t.id + ': percent complete must be 0-100.');
    if (isNaN(D(t.start))) E.push(t.id + ': invalid start date.');
    if (!team.includes(t.owner)) E.push(t.id + ': assignee "' + t.owner + '" is not a team member.');
    t.dep.forEach((x) => { if (x === t.id || !tasks.some((u) => u.id === x)) E.push(t.id + ': invalid dependency ' + x + '.'); });
    if (t.req) { const r = reqs.find((q) => q.id === t.req); if (!r || r.status !== 'Approved') E.push(t.id + ': requirement ' + t.req + ' is not approved, so it cannot be in project scope.'); }
  });
  (s.expenses || []).forEach((e) => E.push(...expenseErrors(s, e)));
  crs.forEach((x) => E.push(...crErrors(s, x)));
  if (!bl.length) E.push('A scope baseline is required.');
  else if (LOCKED.includes(c.status)) {            // after baselining, scope/budget/deadline can only move via approved changes
    const last = bl[bl.length - 1], ap = crs.filter((x) => x.status === 'Approved');
    reqs.filter((r) => r.status === 'Approved' && !last.reqs.includes(r.id)).forEach((r) => E.push(r.id + ' is approved but not in the scope baseline; use a change request.'));
    if (Math.round(last.budget) !== Math.round(c.budget + sum(ap, 'cost'))) E.push('Approved budget differs from the scope baseline; budget changes require an approved change request.');
    if (!isNaN(D(c.deadline)) && F(D(c.deadline) + sum(ap, 'days')) !== last.deadline) E.push('Deadline differs from the scope baseline; deadline changes require an approved change request.');
  }
  (s.defects || []).forEach((d) => {
    if (!String(d.title || '').trim()) E.push(d.id + ': defect title is required.');
    if (d.who && !team.includes(d.who)) E.push(d.id + ': assignee "' + d.who + '" is not a team member.');
    if (d.req && !reqs.some((r) => r.id === d.req)) E.push(d.id + ': unknown requirement ' + d.req + '.');
  });
  (s.checks || []).forEach((q) => { if (q.req && !reqs.some((r) => r.id === q.req)) E.push(q.id + ': unknown requirement ' + q.req + '.'); });
  (s.risks || []).forEach((r) => {
    if (!String(r.desc || '').trim()) E.push(r.id + ': risk description is required.');
    if (!(r.lik >= 1 && r.lik <= 5 && r.imp >= 1 && r.imp <= 5)) E.push(r.id + ': likelihood and impact must be 1-5.');
  });
  try { run(tasks, null); } catch (e) { E.push(e.message); }
  return E;
}

// ---------- unit tests (shown in the app and run by tests/run_tests.js) ----------
export function tests() {
  const R = [], t = (n, e, a) => R.push([n, String(e), String(a), String(e) === String(a)]), s = seed();
  const A = [T('A', 'A', 'x', '2026-01-01', 10, [], 1000, 600, 50, '')], bA = run(A, null), e1 = evm(A, bA, D('2026-01-04'));
  t('EVM: PV at 40% elapsed of 1000 = 400', 400, e1.pv); t('EVM: EV at 50% complete = 500', 500, e1.ev);
  t('EVM: CPI = EV/AC = 500/600', (500 / 600).toFixed(3), e1.cpi.toFixed(3)); t('EVM: SPI = EV/PV = 500/400', 1.25, e1.spi);
  const d = run([T('A', 'a', 'x', '2026-01-01', 5, [], 0, 0, 0, ''), T('B', 'b', 'x', '2026-01-01', 3, ['A'], 0, 0, 0, '')], null);
  t('Dependency: B starts day after A ends', '2026-01-06', F(d.S.B));
  let err = 'none'; try { run([T('A', 'a', 'x', '2026-01-01', 5, ['B'], 0, 0, 0, ''), T('B', 'b', 'x', '2026-01-01', 3, ['A'], 0, 0, 0, '')], null); } catch (e) { err = 'detected'; }
  t('Circular dependency is rejected', 'detected', err);
  const c0 = calc(s);
  t('Seed planned cost (BAC) = approved budget', 5000000, c0.E.bac);
  t('Expenditure ledger total equals Actual Cost (AC)', 3440000, c0.E.ac);
  t('Task actual cost is summed from the ledger (T3)', 820000, c0.tx.find((x) => x.id === 'T3').actual);
  t('Activities over planned cost are detected', 'T1,T2,T3,T4,T5', c0.over.map((x) => x.id).join());
  t('Delayed tasks found at status date (T3, T8)', 'T3,T8', c0.delayed.map((x) => x.id).join());
  t('Delay of T3 impacts successors', 'T6,T7,T9', c0.delayed[0].imp.join());
  t('Forecast finish is later than baseline', true, c0.fin > D('2026-10-25'));
  const ex = { id: 'X', date: '2026-09-10', task: 'T6', cat: 'Labor', desc: 'Test', amount: 1000 };
  t('Valid expenditure is accepted', 0, expenseErrors(s, ex).length);
  t('Expenditure dated after status date is rejected', true, expenseErrors(s, { ...ex, date: '2026-09-20' }).length > 0);
  t('Expenditure before project start is rejected', true, expenseErrors(s, { ...ex, date: '2026-06-01' }).length > 0);
  t('Zero-amount expenditure is rejected', true, expenseErrors(s, { ...ex, amount: 0 }).length > 0);
  t('Expenditure for unknown activity is rejected', true, expenseErrors(s, { ...ex, task: 'T99' }).length > 0);
  t('Seed data passes all validation rules', 0, validateState(s).length);
  t('Task assigned to a non-team member is rejected', true, validateState({ ...s, tasks: s.tasks.map((x, i) => (i ? x : { ...x, owner: 'Nobody' })) }).length > 0);
  t('Duplicate IDs are rejected', true, validateState({ ...s, reqs: [...s.reqs, s.reqs[0]] }).length > 0);
  t('Task linked to unapproved requirement R6 is rejected', true, validateState({ ...s, tasks: s.tasks.map((x, i) => (i === 2 ? { ...x, req: 'R6' } : x)) }).length > 0);
  t('Budget changed without change request is flagged', true, validateState({ ...s, charter: { ...s.charter, budget: 6000000 } }).some((m) => /baseline/.test(m)));
  t('Requirement approved outside change control is flagged', true, validateState({ ...s, reqs: s.reqs.map((r) => (r.id === 'R6' ? { ...r, status: 'Approved' } : r)) }).some((m) => /baseline/.test(m)));
  const throws = (f) => { try { f(); return 'no error'; } catch (e) { return 'rejected'; } };
  t('Rejecting a change request needs a reason', 'rejected', throws(() => decideCR(s, 'CR1', 'Rejected', 'Sponsor', '')));
  t('Deciding a change request needs an approver', 'rejected', throws(() => decideCR(s, 'CR1', 'Approved', ' ')));
  t('Add-type change with an already approved requirement is rejected', true, crErrors(s, { ...s.crs[0], reqs: ['R1'] }).length > 0);
  const s2 = applyCR(s, 'CR1'), c2 = calc(s2);
  t('Approved CR raises budget by 800,000', 5800000, c2.budget); t('Approved CR extends deadline by 21 days', '2026-11-15', F(c2.dl));
  t('Approved CR puts R6 and R7 in scope', 'Approved,Approved', ['R6', 'R7'].map((r) => s2.reqs.find((q) => q.id === r).status).join());
  t('Approved CR adds 2 work packages', 13, s2.tasks.length); t('Planned cost matches new budget', c2.budget, c2.E.bac);
  t('Approved CR creates scope baseline v2 with 7 requirements', '2,7', s2.baselines[1].version + ',' + s2.baselines[1].reqs.length);
  t('Approved CR is written to the change log', 3, s2.scopeLog.length);
  t('Data stays valid after approval', 0, validateState(s2).length);
  const s3 = decideCR(s, 'CR1', 'Rejected', 'Sponsor', 'Out of budget');
  t('Rejected CR leaves budget unchanged', 5000000, calc(s3).budget); t('Rejected CR marks R6 as Rejected', 'Rejected', s3.reqs.find((r) => r.id === 'R6').status);
  t('Cannot decide the same CR twice', 'rejected', throws(() => applyCR(s2, 'CR1')));
  t('Numeric validation: negative cost becomes 0', 0, num('cost', -50)); t('Numeric validation: percent capped at 100', 100, num('pct', 250));
  return R;
}

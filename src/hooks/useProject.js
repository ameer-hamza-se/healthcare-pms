// Central state hook: loads/saves the project through the API (SQLite), falls back to localStorage,
// exposes calculated results (C), validation issues, and every editing action with its control rules.
import { useState, useEffect, useMemo, useCallback } from 'react';
import { seed, calc, decideCR, crErrors, expenseErrors, validateState, nextId, logEntry, sum, D, F, PREFIX, LOCKED, OPEN_CR } from '../../shared/logic.js';

const KEY = 'spms-healthcare-v2';
const DB = 'SQLite database';

export default function useProject() {
  const [db, setDb] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); } });
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState('browser storage (server not running)');
  const [msg, setMsg] = useState('');

  const say = useCallback((m) => { setMsg(m); if (m) setTimeout(() => setMsg(''), 6000); }, []);
  const C = useMemo(() => { try { return calc(db); } catch (e) { return { err: e.message }; } }, [db]);
  const issues = useMemo(() => { try { return validateState(db); } catch (e) { return [e.message]; } }, [db]);

  useEffect(() => {
    fetch('/api/state').then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((s) => { setDb(s); setSource(DB); setReady(true); }).catch(() => setReady(true));
  }, []);

  // Data is only written to the database when every validation rule passes.
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage unavailable */ }
    if (source !== DB || issues.length) return;
    const t = setTimeout(() => fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db) })
      .then((r) => r.json()).then((j) => { if (j.error) say('Database rejected the change: ' + j.error); })
      .catch(() => say('Could not reach the database server.')), 300);
    return () => clearTimeout(t);
  }, [db, ready, source, issues, say]);

  const locked = LOCKED.includes(db.charter.status);
  const approvedReqs = () => db.reqs.filter((r) => r.status === 'Approved').map((r) => r.id);
  const baselineCurrent = () => { const last = db.baselines[db.baselines.length - 1]; const a = approvedReqs(); return !!last && a.length === last.reqs.length && a.every((r) => last.reqs.includes(r)); };
  const isOpenCr = (id) => db.crs.some((c) => c.id === id && OPEN_CR.includes(c.status));

  // ----- generic edits with control rules -----
  const set = (table) => (id, k, v) => {
    if (table === 'tasks' && k === 'dep' && v.some((x) => x === id || !db.tasks.some((t) => t.id === x))) return say('Dependencies must be existing task IDs other than the task itself.');
    if (table === 'tasks' && k === 'req' && v && !db.reqs.some((r) => r.id === v && r.status === 'Approved')) return say('Unapproved requirements cannot be added to the project scope.');
    if (table === 'crs' && !isOpenCr(id)) return say('A decided change request is part of the audit trail and cannot be edited.');
    if (table === 'reqs' && k === 'status') {
      const r = db.reqs.find((x) => x.id === id);
      if (v === 'Approved' && locked) return say('The scope is baselined. Submit a change request to bring this requirement into scope.');
      if (r.status === 'Approved' && v !== 'Approved') {
        if (locked) return say('Approved scope can only be changed through a change request.');
        if (db.tasks.some((t) => t.req === id)) return say('Tasks are linked to this requirement. Unlink them first.');
      }
      if (v !== 'Proposed' && db.crs.some((c) => OPEN_CR.includes(c.status) && c.reqs.includes(id))) return say('This requirement is part of an open change request. Decide the change request instead.');
      return setDb((x) => ({ ...x, reqs: x.reqs.map((q) => (q.id === id ? { ...q, status: v } : q)), scopeLog: logEntry(x, 'Requirement ' + v.toLowerCase(), id, r.status + ' to ' + v) }));
    }
    setDb((x) => ({ ...x, [table]: x[table].map((r) => (r.id === id ? { ...r, [k]: v } : r)) }));
  };
  const del = (table) => (id) => {
    if (table === 'reqs' && (db.tasks.some((t) => t.req === id) || db.crs.some((c) => c.reqs.includes(id)) || db.baselines.some((b) => b.reqs.includes(id)) || db.defects.some((d) => d.req === id) || db.checks.some((q) => q.req === id)))
      return say('Requirement is referenced by tasks, change requests, baselines or quality records and cannot be deleted.');
    if (table === 'tasks' && db.tasks.some((t) => t.dep.includes(id))) return say('Other tasks depend on this task.');
    if (table === 'tasks' && db.expenses.some((e) => e.task === id)) return say('This task has recorded expenditure and cannot be deleted.');
    if (table === 'crs' && !isOpenCr(id)) return say('Decided change requests are part of the audit trail and cannot be deleted.');
    if (table === 'team' && db.tasks.some((t) => t.owner === db.team.find((m) => m.id === id)?.name)) return say('This team member is assigned to tasks.');
    setDb((x) => ({ ...x, [table]: x[table].filter((r) => r.id !== id), ...(table === 'crs' ? { scopeLog: logEntry(x, 'Change withdrawn', id, 'Removed before decision') } : {}) }));
  };
  const add = (table, row) => setDb((x) => ({ ...x, [table]: [...x[table], { id: nextId(x[table], PREFIX[table]), ...row }], ...(table === 'reqs' ? { scopeLog: logEntry(x, 'Requirement added', nextId(x[table], 'R'), row.title) } : {}) }));
  const ch = (k, v) => {
    if ((k === 'budget' || k === 'deadline') && locked) return say('Budget and deadline are baselined. Use a change request to change them.');
    if (k === 'status' && LOCKED.includes(v) && !baselineCurrent()) return say('Freeze the scope baseline first (Scope tab) so the approved scope matches the baseline.');
    setDb((x) => ({ ...x, charter: { ...x.charter, [k]: v } }));
  };
  const plan = (k, v) => setDb((x) => ({ ...x, charter: { ...x.charter, plan: { ...x.charter.plan, [k]: v } } }));
  const setThreshold = (k, v) => setDb((x) => ({ ...x, th: { ...x.th, [k]: v } }));
  const reset = () => setDb(seed());

  // ----- scope and change control -----
  const freezeBaseline = () => {
    if (locked) return say('The baseline is already under change control. New versions are created by approved change requests.');
    setDb((x) => {
      const ap = x.crs.filter((c) => c.status === 'Approved'), ver = x.baselines.length + 1;
      return { ...x, baselines: [...x.baselines, { id: 'B' + ver, version: ver, date: x.charter.statusDate, desc: 'Scope baseline frozen by project manager', reqs: x.reqs.filter((r) => r.status === 'Approved').map((r) => r.id), budget: x.charter.budget + sum(ap, 'cost'), deadline: F(D(x.charter.deadline) + sum(ap, 'days')), cr: '' }], scopeLog: logEntry(x, 'Baseline created', 'B' + ver, 'Approved scope frozen') };
    });
  };
  // Returns a list of error messages (empty list = submitted).
  const submitChange = (f) => {
    let next = db; const reqs = [...f.reqs];
    if (f.type === 'Add' && f.newReq && f.newReq.trim()) { const id = nextId(db.reqs, 'R'); next = { ...next, reqs: [...next.reqs, { id, title: f.newReq.trim(), pri: 'Medium', status: 'Proposed' }] }; reqs.push(id); }
    const cr = { id: nextId(db.crs, 'CR'), title: f.title.trim(), type: f.type, by: f.by.trim(), date: db.charter.statusDate, why: f.why.trim(), cost: +f.cost || 0, days: +f.days || 0, reqs, status: 'Submitted', decidedOn: '', decidedBy: '', note: '' };
    const errs = crErrors(next, cr);
    if (errs.length) return errs;
    setDb({ ...next, crs: [...next.crs, cr], scopeLog: logEntry(next, 'Change submitted', cr.id, cr.title, cr.by) });
    return [];
  };
  const markReview = (id) => setDb((x) => ({ ...x, crs: x.crs.map((c) => (c.id === id && c.status === 'Submitted' ? { ...c, status: 'Under Review' } : c)), scopeLog: logEntry(x, 'Change under review', id, 'Impact analysis started') }));
  const decide = (id, decision, by, note) => { try { setDb(decideCR(db, id, decision, by, note)); say(''); return ''; } catch (e) { say(e.message); return e.message; } };

  // ----- expenditure ledger -----
  const addExpense = (e) => {
    const entry = { id: nextId(db.expenses, 'E'), date: e.date, task: e.task, cat: e.cat, desc: String(e.desc || '').trim(), amount: +e.amount, ref: String(e.ref || '').trim() };
    const errs = expenseErrors(db, entry);
    if (errs.length) return errs;
    setDb((x) => ({ ...x, expenses: [...x.expenses, entry] }));
    return [];
  };

  return { db, C, issues, source, msg, say, set, del, add, ch, plan, setThreshold, reset, freezeBaseline, submitChange, markReview, decide, addExpense };
}

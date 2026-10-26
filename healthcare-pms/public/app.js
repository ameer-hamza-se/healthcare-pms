const { useState, useEffect, useMemo } = React;
const AppKey = 'spms-healthcare-v1';
const h = React.createElement;

function cell(row, key, type, extra, setValue) {
  const value = row[key];

  if (type === 'ro') {
    return h('span', null, typeof value === 'number' ? Math.round(value).toLocaleString() : value);
  }

  if (type === 'ids') {
    return h('input', {
      key: value.join(),
      defaultValue: value.join(', '),
      onBlur: (event) => setValue(row.id, key, event.target.value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean))
    });
  }

  if (type === 'sel') {
    return h(
      'select',
      { value: value, onChange: (event) => setValue(row.id, key, event.target.value) },
      ...extra.map((option) => {
        const [actualValue, label] = Array.isArray(option) ? option : [option, option];
        return h('option', { key: actualValue, value: actualValue }, label);
      })
    );
  }

  return h('input', {
    type: type === 'num' ? 'number' : type === 'date' ? 'date' : 'text',
    min: 0,
    value: value ?? '',
    onChange: (event) => setValue(row.id, key, type === 'num' ? num(key, event.target.value) : event.target.value)
  });
}

function Tbl({ rows, cols, set, del }) {
  return h(
    'div',
    { className: 'tw' },
    h(
      'table',
      null,
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          ...cols.map(([columnKey, label]) => h('th', { key: columnKey }, label)),
          del && h('th', null)
        )
      ),
      h(
        'tbody',
        null,
        ...rows.map((row) => h(
          'tr',
          { key: row.id },
          ...cols.map(([columnKey, label, type, options]) => h('td', { key: `${row.id}-${columnKey}` }, cell(row, columnKey, type, options || [], set))),
          del && h('td', null, h('button', { className: 'x', onClick: () => del(row.id) }, 'Delete'))
        ))
      )
    )
  );
}

function Field(labelText, value, onChange, type) {
  return h(
    'label',
    null,
    labelText,
    type === 'area'
      ? h('textarea', { rows: 3, value: value, onChange: (event) => onChange(event.target.value) })
      : h('input', {
          type: type || 'text',
          value: value,
          onChange: (event) => onChange(type === 'number' ? Math.max(0, +event.target.value || 0) : event.target.value)
        })
  );
}

function AddButton(label, onClick) {
  return h('p', null, h('button', { className: 'p', onClick }, label));
}

function Gantt({ db, calcResult }) {
  const { tasks, milestones } = db;
  const { B, Fc, fin, dl } = calcResult;
  const statusDate = D(db.charter.statusDate);
  const firstDate = Math.min(...tasks.map((task) => B.S[task.id]));
  const lastDate = Math.max(fin, dl, ...milestones.map((milestone) => D(milestone.date)));
  const timelineLength = lastDate - firstDate + 1;

  const position = (date) => ((date - firstDate) / timelineLength) * 100 + '%';
  const widthFor = (value) => (value / timelineLength) * 100 + '%';

  const statusMarker = h('u', { className: 'st', style: { left: position(statusDate) } });
  const deadlineMarker = h('u', { className: 'dl', style: { left: position(dl) } });

  return h(
    'div',
    { className: 'card' },
    h(
      'div',
      { className: 'gr' },
      h('span', { className: 'gl' }, 'Milestones'),
      h(
        'div',
        { className: 'gb' },
        ...milestones.map((milestone) => h(
          'span', {
            key: milestone.id,
            className: 'ms',
            title: milestone.name + ' ' + milestone.date + (milestone.done === 'Yes' ? ' (done)' : ''),
            style: { left: position(D(milestone.date)) }
          },
          milestone.done === 'Yes' ? '◆' : '◇'
        ))
      )
    ),
    ...tasks.map((task) => h(
      'div',
      { className: 'gr', key: task.id },
      h('span', { className: 'gl' }, task.id + ' ' + task.name),
      h(
        'div',
        { className: 'gb' },
        h('i', { className: 'bar', style: { left: position(B.S[task.id]), width: widthFor(task.dur) } }, h('b', { style: { width: task.pct + '%' } })),
        Fc.E[task.id] > B.E[task.id] && h('i', { className: 'late', style: { left: position(B.E[task.id] + 1), width: widthFor(Fc.E[task.id] - B.E[task.id]) } }),
        statusMarker,
        deadlineMarker
      )
    )),
    h(
      'p',
      { style: { fontSize: 12, color: 'var(--mut)', margin: '8px 0 0' } },
      'Dark fill = progress. Hatched = forecast slip. Amber line = status date. Red line = approved deadline. ◆ done milestone, ◇ upcoming. Timeline ' + F(firstDate) + ' to ' + F(lastDate) + '.'
    )
  );
}

function App() {
  const [db, setDb] = useState(() => {
    try {
      const storedValue = localStorage.getItem(AppKey);
      return storedValue ? JSON.parse(storedValue) : seed();
    } catch (error) {
      return seed();
    }
  });
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState('browser storage (server not running)');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/state')
      .then((response) => {
        if (!response.ok) {
          throw new Error('server unavailable');
        }
        return response.json();
      })
      .then((serverState) => {
        setDb(serverState);
        setSource('SQLite database');
        setReady(true);
      })
      .catch(() => {
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    try {
      localStorage.setItem(AppKey, JSON.stringify(db));
    } catch (error) {
      // ignore local storage write failures in private browsing mode
    }

    if (source !== 'SQLite database') {
      return undefined;
    }

    const timer = setTimeout(() => {
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db)
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.error) {
            setMessage('Database rejected the change: ' + result.error);
          }
        })
        .catch(() => {
          setMessage('Could not reach the database server.');
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [db, ready, source]);

  const calcResult = useMemo(() => {
    try {
      return calc(db);
    } catch (error) {
      return { err: error.message };
    }
  }, [db]);

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 5000);
  };

  const setRecord = (tableName) => (id, key, value) => {
    if (tableName === 'tasks' && key === 'dep' && value.some((item) => item === id || !db.tasks.some((task) => task.id === item))) {
      notify('Dependencies must be existing task IDs other than the task itself.');
      return;
    }

    if (tableName === 'tasks' && key === 'req' && value && !db.reqs.some((item) => item.id === value && item.status === 'Approved')) {
      notify('Unapproved requirements cannot be added to the project scope.');
      return;
    }

    if (tableName === 'reqs' && key === 'status' && value === 'Approved' && db.crs.some((changeRequest) => changeRequest.status !== 'Approved' && changeRequest.reqs.includes(id))) {
      notify('This requirement belongs to a change request that is not approved. Approve the change request instead.');
      return;
    }

    if (tableName === 'reqs' && key === 'status' && value !== 'Approved' && db.tasks.some((task) => task.req === id)) {
      notify('Tasks are linked to this requirement. Unlink them first.');
      return;
    }

    setDb((current) => ({
      ...current,
      [tableName]: current[tableName].map((row) => (row.id === id ? { ...row, [key]: value } : row))
    }));
  };

  const deleteRecord = (tableName) => (id) => {
    if (tableName === 'reqs' && db.tasks.some((task) => task.req === id)) {
      notify('Requirement is used by tasks and cannot be deleted.');
      return;
    }

    if (tableName === 'tasks' && db.tasks.some((task) => task.dep.includes(id))) {
      notify('Other tasks depend on this task.');
      return;
    }

    setDb((current) => ({
      ...current,
      [tableName]: current[tableName].filter((row) => row.id !== id)
    }));
  };

  const addRecord = (tableName, row) => {
    setDb((current) => ({
      ...current,
      [tableName]: [...current[tableName], { id: uid(tableName[0].toUpperCase()), ...row }]
    }));
  };

  const updateCharter = (key, value) => {
    setDb((current) => ({
      ...current,
      charter: { ...current.charter, [key]: value }
    }));
  };

  const updatePlan = (key, value) => {
    setDb((current) => ({
      ...current,
      charter: {
        ...current.charter,
        plan: { ...current.charter.plan, [key]: value }
      }
    }));
  };

  const charter = db.charter;
  const teamNames = db.team.map((member) => member.name);
  const approvedRequirements = [['', '(none)'], ...db.reqs.filter((item) => item.status === 'Approved').map((item) => [item.id, item.id + ' ' + item.title])];
  const tabs = ['Dashboard', 'Charter and plan', 'Scope', 'Schedule', 'Cost and EVM', 'Quality', 'Risk', 'Tests'];
  const statusOptions = ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closed'];

  const renderDashboard = () => h(
    'div',
    null,
    h(
      'div',
      { className: 'kp' },
      ...[
        [Math.round((calcResult.E.ev / calcResult.E.bac) * 100) + '%', 'Overall progress (EV / BAC)'],
        [calcResult.pend.length, 'Pending change requests'],
        [calcResult.delayed.length, 'Delayed activities'],
        [M(calcResult.E.ac) + ' of ' + M(calcResult.budget), 'Spent vs approved budget'],
        [calcResult.crit.length, 'Unresolved critical defects'],
        [F(calcResult.fin), 'Forecast finish (deadline ' + F(calcResult.dl) + ')']
      ].map((entry, index) => h('div', { className: 'card', key: index }, h('b', null, entry[0]), h('span', null, entry[1])))
    ),
    h('h2', null, 'Warnings'),
    ...(calcResult.W.length
      ? calcResult.W.map((warning, index) => h('div', { key: index, className: 'w ' + warning[0] }, warning[1]))
      : [h('p', { key: 0, className: 'ok' }, 'All indicators are within thresholds.')]),
    h('h2', null, 'Delayed activities'),
    h(
      'div',
      { className: 'tw' },
      h(
        'table',
        null,
        h('thead', null, h('tr', null, ['Task', 'Owner', 'Complete', 'Slip (days)', 'Delays'].map((label) => h('th', { key: label }, label)))),
        h(
          'tbody',
          null,
          ...calcResult.delayed.map((task) => h(
            'tr',
            { key: task.id },
            h('td', null, task.id + ' ' + task.name),
            h('td', null, task.owner),
            h('td', null, task.pct + '%'),
            h('td', null, task.days),
            h('td', null, task.imp.join(', ') || 'final deadline only')
          ))
        )
      )
    ),
    h('h2', null, 'Status'),
    h('p', null, 'Project status: ', h('b', null, charter.status), '. Milestones done: ' + db.milestones.filter((item) => item.done === 'Yes').length + ' of ' + db.milestones.length + '. Status date ' + charter.statusDate + '.'),
    h('button', { className: 'p np', onClick: () => window.print() }, 'Print report'),
    ' ',
    h('button', {
      className: 'x np',
      onClick: () => { if (window.confirm('Reset all data to the case-study sample?')) setDb(seed()); }
    }, 'Reset sample data')
  );

  const renderCharter = () => h(
    'div',
    null,
    h('h2', null, 'Project charter'),
    h(
      'div',
      { className: 'g2' },
      Field('Project name', charter.name, (value) => updateCharter('name', value)),
      Field('Approved base budget (PKR)', charter.budget, (value) => updateCharter('budget', value), 'number'),
      Field('Start date', charter.start, (value) => updateCharter('start', value), 'date'),
      Field('Deadline', charter.deadline, (value) => updateCharter('deadline', value), 'date'),
      Field('Status date', charter.statusDate, (value) => updateCharter('statusDate', value), 'date'),
      h('label', null, 'Project status', h('select', { value: charter.status, onChange: (event) => updateCharter('status', event.target.value) }, ...statusOptions.map((status) => h('option', { key: status }, status))))
    ),
    h(
      'div',
      { className: 'g2', style: { marginTop: 10 } },
      Field('Objectives', charter.objectives, (value) => updateCharter('objectives', value), 'area'),
      Field('Stakeholders', charter.stakeholders, (value) => updateCharter('stakeholders', value), 'area'),
      Field('In scope', charter.inScope, (value) => updateCharter('inScope', value), 'area'),
      Field('Scope boundaries (out of scope)', charter.outScope, (value) => updateCharter('outScope', value), 'area')
    ),
    h('h2', null, 'Project management plan'),
    h(
      'div',
      { className: 'g2' },
      ...['scope', 'schedule', 'cost', 'quality'].map((key) => Field(key[0].toUpperCase() + key.slice(1) + ' plan', charter.plan[key], (value) => updatePlan(key, value), 'area'))
    ),
    h('h2', null, 'Milestones'),
    h('div', null, h(Tbl, {
      rows: db.milestones,
      set: setRecord('milestones'),
      del: deleteRecord('milestones'),
      cols: [['name', 'Milestone', 'text'], ['date', 'Date', 'date'], ['done', 'Done', 'sel', ['Yes', 'No']]]
    })),
    AddButton('Add milestone', () => addRecord('milestones', { name: 'New milestone', date: charter.deadline, done: 'No' })),
    h('h2', null, 'Responsibilities'),
    h(Tbl, { rows: db.team, set: setRecord('team'), cols: [['name', 'Team member', 'text'], ['resp', 'Responsibility', 'text']] }),
    h('h2', null, 'Project closure'),
    h('div', { className: 'card' }, Field('Closure record (lessons learned, acceptance)', charter.closure, (value) => updateCharter('closure', value), 'area'), AddButton('Close project', () => {
      if ((calcResult.pend && calcResult.pend.length) || (calcResult.crit && calcResult.crit.length)) {
        notify('Cannot close: resolve pending change requests and critical defects first.');
        return;
      }
      updateCharter('status', 'Closed');
      notify('Project marked as closed.');
    }))
  );

  const renderScope = () => {
    const approvedRequirements = db.reqs.filter((item) => item.status === 'Approved');
    const looseTasks = db.tasks.filter((task) => !approvedRequirements.some((requirement) => requirement.id === task.req));

    return h(
      'div',
      null,
      h('h2', null, 'Requirements'),
      h(Tbl, {
        rows: db.reqs,
        set: setRecord('reqs'),
        del: deleteRecord('reqs'),
        cols: [['id', 'ID', 'ro'], ['title', 'Requirement', 'text'], ['pri', 'Priority', 'sel', ['High', 'Medium', 'Low']], ['status', 'Status', 'sel', ['Proposed', 'Approved', 'Rejected']]]
      }),
      AddButton('Add requirement', () => addRecord('reqs', { title: 'New requirement', pri: 'Medium', status: 'Proposed' })),
      h('p', { style: { color: 'var(--mut)' } }, 'Only Approved requirements are part of the project scope and can have work packages.'),
      h('h2', null, 'Change requests'),
      h(Tbl, {
        rows: db.crs,
        set: setRecord('crs'),
        del: deleteRecord('crs'),
        cols: [['id', 'ID', 'ro'], ['title', 'Change', 'text'], ['why', 'Justification', 'text'], ['cost', 'Cost impact (PKR)', 'num'], ['days', 'Schedule impact (days)', 'num'], ['reqs', 'Requirements', 'ids'], ['status', 'Status', 'ro']]
      }),
      h('p', null,
        AddButton('Add change request', () => addRecord('crs', { title: 'New change', why: '', cost: 0, days: 0, reqs: [], status: 'Pending' })),
        ...db.crs.filter((request) => request.status === 'Pending').map((request) => [
          h('span', { key: request.id },
            h('button', {
              className: 'p',
              onClick: () => {
                try {
                  setDb(applyCR(db, request.id));
                  notify('');
                } catch (error) {
                  notify(error.message);
                }
              }
            }, 'Approve ' + request.id),
            ' ',
            h('button', { className: 'x', onClick: () => setRecord('crs')(request.id, 'status', 'Rejected') }, 'Reject ' + request.id),
            ' ')
        ])
      ),
      h('p', { style: { color: 'var(--mut)' } }, 'Approving a change request adds its cost to the budget, its days to the deadline, approves the linked requirements, and creates new work packages that feed QA testing.'),
      h('h2', null, 'Work Breakdown Structure'),
      h(
        'div',
        { className: 'card' },
        h('b', null, '1 ' + charter.name),
        ...approvedRequirements.map((requirement, index) => h('div', { key: requirement.id, className: 'tr' }, h('b', null, '1.' + (index + 1) + ' ' + requirement.title), ...db.tasks.filter((task) => task.req === requirement.id).map((task, subIndex) => h('div', { key: task.id, className: 'tr' }, '1.' + (index + 1) + '.' + (subIndex + 1) + ' ' + task.name + ' (' + M(task.cost) + ')')))),
        h('div', { className: 'tr' }, h('b', null, '1.' + (approvedRequirements.length + 1) + ' Project management and integration'), ...looseTasks.map((task, index) => h('div', { key: task.id, className: 'tr' }, '1.' + (approvedRequirements.length + 1) + '.' + (index + 1) + ' ' + task.name + ' (' + M(task.cost) + ')'))))
      )
    );
  };

  const renderSchedule = () => {
    if (calcResult.err) {
      return h(
        'div',
        null,
        h('div', { className: 'toast' }, 'Schedule error: ' + calcResult.err),
        h(Tbl, {
          rows: db.tasks,
          set: setRecord('tasks'),
          cols: [['id', 'ID', 'ro'], ['name', 'Task', 'ro'], ['dep', 'Depends on', 'ids']]
        })
      );
    }

    return h(
      'div',
      null,
      h('h2', null, 'Activities'),
      h(Tbl, {
        rows: db.tasks,
        set: setRecord('tasks'),
        del: deleteRecord('tasks'),
        cols: [['id', 'ID', 'ro'], ['name', 'Activity', 'text'], ['owner', 'Assigned to', 'sel', teamNames], ['req', 'Requirement', 'sel', approvedRequirements], ['dur', 'Days', 'num'], ['dep', 'Depends on', 'ids'], ['ps', 'Start', 'ro'], ['pe', 'End', 'ro'], ['fe', 'Forecast end', 'ro'], ['pct', '% done', 'num']]
      }),
      AddButton('Add activity', () => addRecord('tasks', { name: 'New activity', owner: teamNames[0], start: charter.start, dur: 5, dep: [], cost: 0, actual: 0, pct: 0, req: '' })),
      h('p', null, 'Start dates move automatically when a dependency finishes later. Approved deadline: ', h('b', null, F(calcResult.dl)), '. Forecast finish: ', h('b', { className: calcResult.fin > calcResult.dl ? 'bd' : 'ok' }, F(calcResult.fin)), '.'),
      h('h2', null, 'Delay impact'),
      ...(calcResult.delayed.length
        ? calcResult.delayed.map((task) => h('div', { key: task.id, className: 'w c' }, task.id + ' ' + task.name + ' is late by ' + task.days + ' day(s). Delays: ' + (task.imp.join(', ') || 'no direct successors') + '. Shifted activities: ' + calcResult.impacted.join(', ') + '.')))
        : [h('p', { key: 0, className: 'ok' }, 'No delayed activities.')]),
      h('h2', null, 'Gantt timeline'),
      h(Gantt, { db, calcResult })
    );
  };

  const renderCost = () => {
    const E = calcResult.E;
    const statusDate = D(charter.statusDate);
    const rows = db.tasks.map((task) => ({
      ...task,
      pv: task.cost * Math.min(1, Math.max(0, (statusDate - calcResult.B.S[task.id] + 1) / task.dur)),
      ev: task.cost * task.pct / 100
    }));

    return h(
      'div',
      null,
      h(
        'div',
        { className: 'kp' },
        ...[['PV', M(E.pv)], ['EV', M(E.ev)], ['AC', M(E.ac)], ['CPI', f2(E.cpi)], ['SPI', f2(E.spi)], ['EAC', M(E.eac)]].map(([label, value]) => h('div', { className: 'card', key: label }, h('b', { className: ((label === 'CPI' && E.cpi < db.th.cpi) || (label === 'SPI' && E.spi < db.th.spi)) ? 'bd' : '' }, value), h('span', null, label === 'PV' ? 'Planned Value' : label === 'EV' ? 'Earned Value' : label === 'AC' ? 'Actual Cost' : label === 'EAC' ? 'Estimate at completion (BAC/CPI)' : label + ' (threshold ' + db.th[label.toLowerCase()] + ')'))))
      ),
      h('p', null, 'Total planned budget (BAC) ', h('b', null, M(E.bac)), ' vs approved budget ', h('b', null, M(calcResult.budget)), '. CV = ', M(E.cv), ', SV = ', M(E.sv), '.'),
      ...calcResult.W.filter((item) => /CPI|SPI|budget|Estimate/.test(item[1])).map((item, index) => h('div', { key: index, className: 'w ' + item[0] }, item[1])),
      h('p', null,
        h('label', { style: { display: 'inline-block' } }, 'CPI threshold ', h('input', { style: { width: 70 }, type: 'number', step: 0.05, value: db.th.cpi, onChange: (event) => setDb((current) => ({ ...current, th: { ...current.th, cpi: +event.target.value || 0 } })) })),
        ' ',
        h('label', { style: { display: 'inline-block' } }, 'SPI threshold ', h('input', { style: { width: 70 }, type: 'number', step: 0.05, value: db.th.spi, onChange: (event) => setDb((current) => ({ ...current, th: { ...current.th, spi: +event.target.value || 0 } })) }))
      ),
      h(Tbl, {
        rows,
        set: setRecord('tasks'),
        cols: [['id', 'ID', 'ro'], ['name', 'Activity', 'ro'], ['cost', 'Planned cost', 'num'], ['actual', 'Actual cost', 'num'], ['pct', '% done', 'num'], ['pv', 'PV', 'ro'], ['ev', 'EV', 'ro']]
      })
    );
  };

  const renderQuality = () => h(
    'div',
    null,
    h('h2', null, 'Defect tracking'),
    h(Tbl, {
      rows: db.defects,
      set: setRecord('defects'),
      del: deleteRecord('defects'),
      cols: [['id', 'ID', 'ro'], ['title', 'Defect', 'text'], ['mod', 'Module', 'text'], ['sev', 'Severity', 'sel', ['Critical', 'High', 'Medium', 'Low']], ['who', 'Assigned to', 'sel', teamNames], ['status', 'Status', 'sel', ['Open', 'In Progress', 'Resolved', 'Closed']]]
    }),
    AddButton('Log defect', () => addRecord('defects', { title: 'New defect', mod: '', sev: 'Medium', who: teamNames[6], status: 'Open' })),
    h('h2', null, 'Quality checklist and inspection results'),
    h(Tbl, {
      rows: db.checks,
      set: setRecord('checks'),
      del: deleteRecord('checks'),
      cols: [['id', 'ID', 'ro'], ['deliv', 'Deliverable', 'text'], ['item', 'Check', 'text'], ['result', 'Result', 'sel', ['Pending', 'Pass', 'Fail']], ['note', 'Notes', 'text']]
    }),
    AddButton('Add check', () => addRecord('checks', { deliv: '', item: 'New check', result: 'Pending', note: '' })),
    h('p', null, 'Inspection: ' + db.checks.filter((item) => item.result === 'Pass').length + ' passed, ' + db.checks.filter((item) => item.result === 'Fail').length + ' failed, ' + db.checks.filter((item) => item.result === 'Pending').length + ' pending.')
  );

  const renderRisk = () => {
    const rankedRisks = db.risks.map((risk) => ({ ...risk, score: risk.lik * risk.imp })).sort((left, right) => right.score - left.score);
    const matrixColor = (score) => score >= 15 ? '#f3b3aa44' : score >= 8 ? '#f0c98a44' : '#a9d9b944';

    return h(
      'div',
      null,
      h('h2', null, 'Risk register'),
      h(Tbl, {
        rows: rankedRisks,
        set: setRecord('risks'),
        del: deleteRecord('risks'),
        cols: [['id', 'ID', 'ro'], ['desc', 'Risk or issue', 'text'], ['lik', 'Likelihood 1-5', 'num'], ['imp', 'Impact 1-5', 'num'], ['score', 'Score', 'ro'], ['prev', 'Preventive action', 'text'], ['corr', 'Corrective action', 'text']]
      }),
      AddButton('Add risk', () => addRecord('risks', { desc: 'New risk', lik: 3, imp: 3, prev: '', corr: '' })),
      h('h2', null, 'Prioritization matrix (likelihood × impact)'),
      h(
        'div',
        { className: 'mx' },
        h('div', { className: 'h' }),
        ...[1, 2, 3, 4, 5].map((impact) => h('div', { key: impact, className: 'h' }, 'Impact ' + impact)),
        ...[5, 4, 3, 2, 1].flatMap((likelihood) => [h('div', { key: 'label-' + likelihood, className: 'h' }, 'Likelihood ' + likelihood), ...[1, 2, 3, 4, 5].map((impact) => h('div', { key: likelihood + '-' + impact, style: { background: matrixColor(likelihood * impact) } }, rankedRisks.filter((risk) => risk.lik === likelihood && risk.imp === impact).map((risk) => risk.id).join(', ')))])
      ),
      h('h2', null, 'Process Decision Program Chart (ranked by score)'),
      ...rankedRisks.map((risk) => h('div', { className: 'pd', key: risk.id }, h('div', null, h('small', null, 'Goal'), 'Deliver within 16 weeks'), h('div', null, h('small', null, 'Potential problem (score ' + risk.score + ')'), risk.desc), h('div', null, h('small', null, 'Preventive action'), risk.prev), h('div', null, h('small', null, 'Corrective action'), risk.corr)))
    );
  };

  const renderTests = () => {
    const results = tests();
    return h(
      'div',
      null,
      h('h2', null, 'Automated test cases (' + results.filter((item) => item[3]).length + ' of ' + results.length + ' pass)'),
      h(
        'div',
        { className: 'tw' },
        h(
          'table',
          null,
          h('thead', null, h('tr', null, ['Test', 'Expected', 'Actual', 'Result'].map((label) => h('th', { key: label }, label)))),
          h('tbody', null, ...results.map((result, index) => h('tr', { key: index }, h('td', null, result[0]), h('td', null, result[1]), h('td', null, result[2]), h('td', { className: result[3] ? 'ok' : 'bd' }, result[3] ? 'PASS' : 'FAIL')))))
        )
      )
    );
  };

  const renderBody = () => {
    if (calcResult.err && activeTab !== 'Charter and plan' && activeTab !== 'Scope') {
      return h('div', null, h('div', { className: 'toast' }, 'Schedule error: ' + calcResult.err + '. Fix the task dependencies on the Schedule tab.'));
    }

    if (activeTab === 'Dashboard') return renderDashboard();
    if (activeTab === 'Charter and plan') return renderCharter();
    if (activeTab === 'Scope') return renderScope();
    if (activeTab === 'Schedule') return renderSchedule();
    if (activeTab === 'Cost and EVM') return renderCost();
    if (activeTab === 'Quality') return renderQuality();
    if (activeTab === 'Risk') return renderRisk();
    return renderTests();
  };

  return h(
    'div',
    null,
    h('header', null, h('h1', null, charter.name), h('p', null, 'Five-hospital network · budget ' + M(calcResult.budget || charter.budget) + ' · deadline ' + (calcResult.dl ? F(calcResult.dl) : charter.deadline) + ' · data stored in: ' + source)),
    h('nav', null, ...tabs.map((tab) => h('button', { key: tab, className: activeTab === tab ? 'on' : '', onClick: () => setActiveTab(tab) }, tab))),
    h('main', null, message && h('div', { className: 'toast' }, message), renderBody())
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));

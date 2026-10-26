# Smart Healthcare Project Management System (v2)
CSE-494 Software Project Management, Mid-term Fall 2026 (CLO-6). React (Vite) front end + Node.js server + SQLite database.

## Setup
Requires Node.js 22.5 or newer (the server uses the built-in `node:sqlite`) and internet access for `npm install`.

    npm install

## Run (development: two terminals)
    npm run server     # terminal 1: API + SQLite database on http://localhost:3000
    npm run dev        # terminal 2: React app with hot reload, open the URL Vite prints (http://localhost:5173)

## Run (production: one command)
    npm start          # builds the React app, then serves it and the API on http://localhost:3000

`data/pms.db` is created on first start (an older v1 database file is rebuilt automatically) and filled with the healthcare case-study sample data.
If the server is not running, the app still works and keeps data in browser storage.

## Interface
Sidebar navigation with alert counters, a status bar (budget, deadline, database connection, data validity), light and dark themes (toggle in the top bar, remembered), colour-coded status badges, KPI cards, CPI/SPI gauges, an S-curve of planned value vs actual cost, and a Gantt timeline with month scale. The layout adapts to tablets and phones and prints cleanly from the Dashboard.

## Tests
    npm test           # 62 unit + API/database tests, writes TEST_REPORT.md
The unit tests also run inside the app on the **Tests** tab.

## Project structure
    src/
      main.jsx, App.jsx, styles.css
      hooks/useProject.js            state, API load/save, all editing actions and scope-control rules
      components/
        common/    DataTable, Field, Toast, Icon, Badge, ValidationPanel
        layout/    Sidebar, Topbar, PageHeader
        dashboard/ Dashboard, KpiCards, WarningList, DelayedTable
        charter/   CharterPage, CharterForm, PlanForm, Milestones, TeamTable, ClosurePanel
        scope/     ScopePage, RequirementsTable, ChangeRequests, WbsTree
        schedule/  SchedulePage, ActivityTable, DelayImpact, GanttChart
        cost/      CostPage, EvmCards (CPI/SPI gauges), SCurve, BudgetUsage, ExpenseForm, ExpenseLedger, CostTable
        quality/   QualityPage, DefectTracker, QualityChecklist
        risk/      RiskPage, RiskRegister, PrioritizationMatrix, PdpcChart
        tests/     TestsPage
    shared/logic.js        scheduling, delay forecast, EVM, change-request approval, validation, unit tests
    server/index.js        HTTP + SQLite persistence (GET/PUT /api/state), server-side validation in a transaction
    db/schema.sql          11-table schema with foreign keys and CHECK constraints
    db/sample_data.sql     sample data (regenerate: npm run sample-sql)
    tests/run_tests.js     test runner

## Scope and change control
- Requirements move Proposed -> Approved/Rejected. Once the project is in Execution, a requirement can only enter or leave scope through a change request.
- Change requests follow Submitted -> Under Review -> Approved/Rejected. Each needs a requester, justification, cost and schedule impact, and linked requirements. A decision records approver, date and reason (a reason is mandatory to reject).
- **Impact preview** shows budget, deadline, forecast finish, scope and work packages before and after approval.
- Approving a change updates budget and deadline, approves linked requirements, creates work packages (feeding QA testing), creates a new **scope baseline** version, and writes the **scope change log**.
- Decided change requests are locked (audit trail). Budget and deadline cannot be edited directly once baselined.
- **Traceability matrix** links each requirement to tasks, cost, spend, open defects, quality checks and change requests, and flags scope without work packages or outside the baseline.

## Expenditure tracking
- Actual cost is never typed in: every activity's actual cost is the sum of its **expenditure ledger** entries (date, activity, category, description, amount, invoice reference).
- Entries must have an existing activity, amount > 0, a date between project start and the status date, a category and a description.
- AC, CPI and EAC in the EVM calculation come from the ledger. The Cost tab shows budget usage, spend by category, and planned vs actual per activity with over-plan flags.

## Validation (one rule set, three layers)
1. Input rules: numbers clamped, dates typed, dropdowns for controlled values, blocked edits (for example unapproved requirements on tasks).
2. `validateState` in `shared/logic.js` runs in the browser on every change. While any rule fails, a banner lists the issues and nothing is written to the database.
3. The server runs the same `validateState` on every save and writes everything in a single transaction. SQLite CHECK, FOREIGN KEY and UNIQUE constraints are the last line of defence.
Cross-module rules include: task assignee must be a team member, expenditure must reference an existing activity, approved scope must match the baseline, budget and deadline must match approved changes, defects and checks must reference real requirements, no duplicate IDs, no circular dependencies.

## Requirement map
1. Initiation and integration: Charter and plan tab
2. Scope and WBS: Scope tab (unapproved requirements are blocked from tasks)
3. Schedule and resources: Schedule tab (dependencies, delay impact, Gantt)
4. Cost and EVM: Cost and EVM tab (PV, EV, AC, CPI, SPI, CV, SV, EAC, threshold warnings)
5. Quality and risk: Quality tab, Risk tab (prioritization matrix, PDPC)
6. Integration and reporting: Dashboard (printable report)

## Demo script
1. Dashboard: note the warnings (low CPI/SPI, 2 delayed tasks, 2 critical defects, pending CR1).
2. Scope: select CR1, read the impact preview, enter an approver and approve. Budget becomes PKR 5,800,000, deadline +21 days, R6/R7 approved, two work packages added, baseline v2 and the change log updated. Then try rejecting a change without a reason.
3. Schedule: enter a circular dependency and see it rejected; view the Gantt and delay impact.
4. Cost and EVM: record an expenditure (try a date after the status date and an amount of 0 to see validation), then watch AC, CPI and the over-plan flags update.
5. Quality and Risk: resolve a critical defect; show the matrix and PDPC.
6. Restart the server: the data is still there (SQLite).

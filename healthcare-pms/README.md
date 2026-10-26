# Smart Healthcare Project Management System
CSE-494 Software Project Management, Mid-term Fall 2026 (CLO-6). React front end + Node.js server + SQLite database.

## Run
Requires Node.js 22.5 or newer (uses the built-in `node:sqlite`, so there is nothing to `npm install`).

    node server.js          # then open http://localhost:3000

The database file is created at `data/pms.db` on first start and filled with the healthcare case-study sample data.
React is loaded from the cdnjs CDN, so the browser needs internet access the first time.

## Tests
    node tests/run_tests.js     # 31 unit + API/database tests, writes TEST_REPORT.md
The same unit tests also run inside the app on the **Tests** tab.

## Structure
| Path | Purpose |
|---|---|
| `public/index.html` | React GUI (8 tabs), loads data from and saves to the server |
| `public/logic.js` | Scheduling (dependencies, delay forecast), EVM, change-request approval, validation, unit tests |
| `server.js` | HTTP server and SQLite persistence (`GET/PUT /api/state`), server-side validation inside a transaction |
| `db/schema.sql` | Database schema (11 tables, FK and CHECK constraints) |
| `db/sample_data.sql` | Case-study sample data (`node scripts/make_sample_sql.js` regenerates it) |
| `tests/run_tests.js` | Test runner, produces `TEST_REPORT.md` |

## Requirement map
1. Initiation and integration: Charter and plan tab (charter, plan, milestones, status, responsibilities, closure)
2. Scope and WBS: Scope tab (requirements, change requests, generated WBS; unapproved requirements are blocked from tasks)
3. Schedule and resources: Schedule tab (activities, owners, dependencies, forecast, delay impact, Gantt)
4. Cost and EVM: Cost and EVM tab (PV, EV, AC, CPI, SPI, CV, SV, EAC, threshold warnings)
5. Quality and risk: Quality tab (defects, checklist), Risk tab (register, prioritization matrix, PDPC view)
6. Integration and reporting: Dashboard (progress, pending changes, delayed activities, budget, critical defects, printable)

## Demo script (for the viva)
1. Dashboard: note warnings (CPI/SPI low, 2 delayed tasks, 2 critical defects, pending CR1).
2. Scope: approve CR1; budget becomes PKR 5,800,000, deadline +21 days, R6/R7 approved, two tasks added.
3. Schedule: change a dependency to a circular one, see it rejected; view Gantt and delay impact.
4. Cost and EVM: edit % done or actual cost and watch CPI/SPI and warnings change.
5. Quality/Risk: resolve a critical defect; view the matrix and PDPC.
6. Stop and restart the server: data is still there (SQLite).

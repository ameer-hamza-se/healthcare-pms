# Test report

Generated 2026-10-25T13:42:18.743Z. 31 of 31 tests passed.

| Type | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| Unit | EVM: PV at 40% elapsed of 1000 = 400 | 400 | 400 | PASS |
| Unit | EVM: EV at 50% complete = 500 | 500 | 500 | PASS |
| Unit | EVM: CPI = EV/AC = 500/600 | 0.833 | 0.833 | PASS |
| Unit | EVM: SPI = EV/PV = 500/400 | 1.25 | 1.25 | PASS |
| Unit | Dependency: B starts day after A ends | 2026-01-06 | 2026-01-06 | PASS |
| Unit | Circular dependency is rejected | detected | detected | PASS |
| Unit | Seed baseline cost = approved budget | 5000000 | 5000000 | PASS |
| Unit | Delayed tasks found at status date (T3, T8) | T3,T8 | T3,T8 | PASS |
| Unit | Delay of T3 impacts successors | T6,T7,T9 | T6,T7,T9 | PASS |
| Unit | Forecast finish is later than baseline | true | true | PASS |
| Unit | Unapproved requirement R6 cannot be scheduled | false | false | PASS |
| Unit | Approved CR raises budget by 800,000 | 5800000 | 5800000 | PASS |
| Unit | Approved CR extends deadline by 21 days | 2026-11-15 | 2026-11-15 | PASS |
| Unit | Approved CR approves R6 in scope | true | true | PASS |
| Unit | Approved CR adds 2 work packages | 13 | 13 | PASS |
| Unit | Planned cost matches new budget | 5800000 | 5800000 | PASS |
| Unit | Cannot approve CR twice | rejected | rejected | PASS |
| Unit | Numeric validation: negative cost becomes 0 | 0 | 0 | PASS |
| Unit | Numeric validation: percent capped at 100 | 100 | 100 | PASS |
| Integration | DB is seeded with 11 tasks on first start | 11 | 11 | PASS |
| Integration | Seed budget stored in database | 5000000 | 5000000 | PASS |
| Integration | Negative cost rejected by API (HTTP 400) | 400 | 400 | PASS |
| Integration | Task linked to unapproved requirement R6 rejected | 400 | 400 | PASS |
| Integration | Circular dependency rejected | 400 | 400 | PASS |
| Integration | Rejected changes leave database unchanged | 5000000 | 5000000 | PASS |
| Integration | Approved change request saved (HTTP 200) | 200 | 200 | PASS |
| Integration | Persisted approved budget after change request | 5800000 | 5800000 | PASS |
| Integration | Persisted approved deadline | 2026-11-15 | 2026-11-15 | PASS |
| Integration | R6 approved in database | true | true | PASS |
| Integration | Work packages in database after change request | 13 | 13 | PASS |
| Integration | Data survives restart (reopen database file) | 13 | 13 | PASS |

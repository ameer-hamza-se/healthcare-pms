# Test report

Generated 2026-10-25T19:22:53.433Z. 62 of 62 tests passed.

| Type | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| Unit | EVM: PV at 40% elapsed of 1000 = 400 | 400 | 400 | PASS |
| Unit | EVM: EV at 50% complete = 500 | 500 | 500 | PASS |
| Unit | EVM: CPI = EV/AC = 500/600 | 0.833 | 0.833 | PASS |
| Unit | EVM: SPI = EV/PV = 500/400 | 1.25 | 1.25 | PASS |
| Unit | Dependency: B starts day after A ends | 2026-01-06 | 2026-01-06 | PASS |
| Unit | Circular dependency is rejected | detected | detected | PASS |
| Unit | Seed planned cost (BAC) = approved budget | 5000000 | 5000000 | PASS |
| Unit | Expenditure ledger total equals Actual Cost (AC) | 3440000 | 3440000 | PASS |
| Unit | Task actual cost is summed from the ledger (T3) | 820000 | 820000 | PASS |
| Unit | Activities over planned cost are detected | T1,T2,T3,T4,T5 | T1,T2,T3,T4,T5 | PASS |
| Unit | Delayed tasks found at status date (T3, T8) | T3,T8 | T3,T8 | PASS |
| Unit | Delay of T3 impacts successors | T6,T7,T9 | T6,T7,T9 | PASS |
| Unit | Forecast finish is later than baseline | true | true | PASS |
| Unit | Valid expenditure is accepted | 0 | 0 | PASS |
| Unit | Expenditure dated after status date is rejected | true | true | PASS |
| Unit | Expenditure before project start is rejected | true | true | PASS |
| Unit | Zero-amount expenditure is rejected | true | true | PASS |
| Unit | Expenditure for unknown activity is rejected | true | true | PASS |
| Unit | Seed data passes all validation rules | 0 | 0 | PASS |
| Unit | Task assigned to a non-team member is rejected | true | true | PASS |
| Unit | Duplicate IDs are rejected | true | true | PASS |
| Unit | Task linked to unapproved requirement R6 is rejected | true | true | PASS |
| Unit | Budget changed without change request is flagged | true | true | PASS |
| Unit | Requirement approved outside change control is flagged | true | true | PASS |
| Unit | Rejecting a change request needs a reason | rejected | rejected | PASS |
| Unit | Deciding a change request needs an approver | rejected | rejected | PASS |
| Unit | Add-type change with an already approved requirement is rejected | true | true | PASS |
| Unit | Approved CR raises budget by 800,000 | 5800000 | 5800000 | PASS |
| Unit | Approved CR extends deadline by 21 days | 2026-11-15 | 2026-11-15 | PASS |
| Unit | Approved CR puts R6 and R7 in scope | Approved,Approved | Approved,Approved | PASS |
| Unit | Approved CR adds 2 work packages | 13 | 13 | PASS |
| Unit | Planned cost matches new budget | 5800000 | 5800000 | PASS |
| Unit | Approved CR creates scope baseline v2 with 7 requirements | 2,7 | 2,7 | PASS |
| Unit | Approved CR is written to the change log | 3 | 3 | PASS |
| Unit | Data stays valid after approval | 0 | 0 | PASS |
| Unit | Rejected CR leaves budget unchanged | 5000000 | 5000000 | PASS |
| Unit | Rejected CR marks R6 as Rejected | Rejected | Rejected | PASS |
| Unit | Cannot decide the same CR twice | rejected | rejected | PASS |
| Unit | Numeric validation: negative cost becomes 0 | 0 | 0 | PASS |
| Unit | Numeric validation: percent capped at 100 | 100 | 100 | PASS |
| Integration | DB is seeded with 11 tasks on first start | 11 | 11 | PASS |
| Integration | Seed budget stored in database | 5000000 | 5000000 | PASS |
| Integration | Expenditure ledger stored (16 entries) | 16 | 16 | PASS |
| Integration | Actual cost derived from ledger | 3440000 | 3440000 | PASS |
| Integration | Negative cost rejected by API (HTTP 400) | 400 | 400 | PASS |
| Integration | Task linked to unapproved requirement R6 rejected | 400 | 400 | PASS |
| Integration | Circular dependency rejected | 400 | 400 | PASS |
| Integration | Expenditure dated after status date rejected | 400 | 400 | PASS |
| Integration | Expenditure for unknown task rejected | 400 | 400 | PASS |
| Integration | Budget change without change request rejected | 400 | 400 | PASS |
| Integration | Requirement approved outside change control rejected | 400 | 400 | PASS |
| Integration | Rejected changes leave database unchanged | 5000000 | 5000000 | PASS |
| Integration | Valid expenditure saved (HTTP 200) | 200 | 200 | PASS |
| Integration | Actual cost increases after new expenditure | 3540000 | 3540000 | PASS |
| Integration | Approved change request saved (HTTP 200) | 200 | 200 | PASS |
| Integration | Persisted approved budget after change request | 5800000 | 5800000 | PASS |
| Integration | Persisted approved deadline | 2026-11-15 | 2026-11-15 | PASS |
| Integration | R6 approved in database | true | true | PASS |
| Integration | Work packages in database after change request | 13 | 13 | PASS |
| Integration | Scope baseline v2 and change log persisted | 2,3 | 2,3 | PASS |
| Integration | Approver recorded on change request | Project Sponsor | Project Sponsor | PASS |
| Integration | Data survives restart (reopen database file) | 13 | 13 | PASS |

// Runs unit tests (logic.js) and API/database integration tests, then writes TEST_REPORT.md. Run: node tests/run_tests.js
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import * as L from "../shared/logic.js";
import * as S from "../server/index.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
(async () => {
  const R = L.tests().map((r) => ["Unit", ...r]),
    t = (n, e, a) =>
      R.push(["Integration", n, String(e), String(a), String(e) === String(a)]);
  const file = path.join(os.tmpdir(), "pms-test-" + Date.now() + ".db"),
    srv = await S.start(0, file),
    u = "http://localhost:" + srv.address().port,
    j = async (m, b) => {
      const r = await fetch(u + "/api/state", {
        method: m,
        headers: { "Content-Type": "application/json" },
        body: b && JSON.stringify(b),
      });
      return { s: r.status, b: await r.json() };
    };
  let g = await j("GET");
  t("DB is seeded with 11 tasks on first start", 11, g.b.tasks.length);
  t("Seed budget stored in database", 5000000, g.b.charter.budget);
  t("Expenditure ledger stored (16 entries)", 16, g.b.expenses.length);
  t("Actual cost derived from ledger", 3440000, L.calc(g.b).E.ac);
  const clone = () => JSON.parse(JSON.stringify(g.b));
  let bad = clone();
  bad.tasks[0].cost = -5;
  let r = await j("PUT", bad);
  t("Negative cost rejected by API (HTTP 400)", 400, r.s);
  bad = clone();
  bad.tasks[2].req = "R6";
  r = await j("PUT", bad);
  t("Task linked to unapproved requirement R6 rejected", 400, r.s);
  bad = clone();
  bad.tasks[0].dep = ["T11"];
  r = await j("PUT", bad);
  t("Circular dependency rejected", 400, r.s);
  bad = clone();
  bad.expenses.push({
    id: "E99",
    date: "2026-09-20",
    task: "T6",
    cat: "Labor",
    desc: "Future spend",
    amount: 1000,
    ref: "",
  });
  r = await j("PUT", bad);
  t("Expenditure dated after status date rejected", 400, r.s);
  bad = clone();
  bad.expenses.push({
    id: "E99",
    date: "2026-09-10",
    task: "T99",
    cat: "Labor",
    desc: "Bad task",
    amount: 1000,
    ref: "",
  });
  r = await j("PUT", bad);
  t("Expenditure for unknown task rejected", 400, r.s);
  bad = clone();
  bad.charter.budget = 9000000;
  r = await j("PUT", bad);
  t("Budget change without change request rejected", 400, r.s);
  bad = clone();
  bad.reqs.find((x) => x.id === "R6").status = "Approved";
  r = await j("PUT", bad);
  t("Requirement approved outside change control rejected", 400, r.s);
  g = await j("GET");
  t("Rejected changes leave database unchanged", 5000000, L.calc(g.b).E.bac);
  const good = clone();
  good.expenses.push({
    id: "E17",
    date: "2026-09-14",
    task: "T6",
    cat: "Testing",
    desc: "Load test licence",
    amount: 100000,
    ref: "INV-15",
  });
  r = await j("PUT", good);
  t("Valid expenditure saved (HTTP 200)", 200, r.s);
  g = await j("GET");
  t("Actual cost increases after new expenditure", 3540000, L.calc(g.b).E.ac);
  const ok = L.decideCR(g.b, "CR1", "Approved", "Project Sponsor");
  r = await j("PUT", ok);
  t("Approved change request saved (HTTP 200)", 200, r.s);
  g = await j("GET");
  const c = L.calc(g.b);
  t("Persisted approved budget after change request", 5800000, c.budget);
  t("Persisted approved deadline", "2026-11-15", L.F(c.dl));
  t(
    "R6 approved in database",
    true,
    g.b.reqs.find((x) => x.id === "R6").status === "Approved",
  );
  t("Work packages in database after change request", 13, g.b.tasks.length);
  t(
    "Scope baseline v2 and change log persisted",
    "2,3",
    g.b.baselines.length + "," + g.b.scopeLog.length,
  );
  t(
    "Approver recorded on change request",
    "Project Sponsor",
    g.b.crs[0].decidedBy,
  );
  srv.close();
  const db2 = S.openDb(file);
  t(
    "Data survives restart (reopen database file)",
    13,
    S.loadState(db2).tasks.length,
  );
  const pass = R.filter((x) => x[4]).length;
  let md =
    "# Test report\n\nGenerated " +
    new Date().toISOString() +
    ". " +
    pass +
    " of " +
    R.length +
    " tests passed.\n\n| Type | Test case | Expected | Actual | Result |\n|---|---|---|---|---|\n" +
    R.map(
      (x) =>
        "| " +
        x.slice(0, 4).join(" | ") +
        " | " +
        (x[4] ? "PASS" : "FAIL") +
        " |",
    ).join("\n") +
    "\n";
  fs.writeFileSync(path.join(__dirname, "..", "TEST_REPORT.md"), md);
  R.forEach((x) =>
    console.log(
      (x[4] ? "PASS " : "FAIL ") +
        x[1] +
        " | expected " +
        x[2] +
        " | actual " +
        x[3],
    ),
  );
  console.log(pass + "/" + R.length + " passed");
  process.exit(pass === R.length ? 0 : 1);
})();

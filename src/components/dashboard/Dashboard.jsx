import KpiCards from "./KpiCards.jsx";
import WarningList from "./WarningList.jsx";
import DelayedTable from "./DelayedTable.jsx";
import ValidationPanel from "../common/ValidationPanel.jsx";
import SCurve from "../cost/SCurve.jsx";

export default function Dashboard({ p }) {
  const { db, C, reset, issues } = p;
  const c = db.charter;
  const done = db.milestones.filter((m) => m.done === "Yes").length;
  return (
    <div>
      <KpiCards C={C} issues={issues.length} />
      <div className="cols2 dashboard-charts">
        <div>
          <h2>Planned value vs actual cost</h2>
          <SCurve db={db} C={C} />
        </div>
        <div>
          <h2>Warnings</h2>
          <WarningList warnings={C.W} />
        </div>
      </div>
      <h2>Delayed activities</h2>
      <DelayedTable delayed={C.delayed} />
      <h2>Data validation</h2>
      <ValidationPanel issues={issues} />
      <h2>Status</h2>
      <p>
        Project status: <b>{c.status}</b>. Milestones done: {done} of{" "}
        {db.milestones.length}. Status date {c.statusDate}.
      </p>
      <button className="p np" onClick={() => window.print()}>
        Print report
      </button>{" "}
      <button
        className="x np"
        onClick={() => {
          if (confirm("Reset all data to the case-study sample?")) reset();
        }}
      >
        Reset sample data
      </button>
    </div>
  );
}

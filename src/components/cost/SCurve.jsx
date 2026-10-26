import { useState } from "react";
import { D, F, M } from "../../../shared/logic.js";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Cumulative planned value (S-curve) against actual cost from the ledger, with budget, status date and deadline.
export default function SCurve({ db, C }) {
  const c = db.charter;
  const lo = D(c.start);
  const st = D(c.statusDate);
  const hi = Math.max(C.dl, C.fin);
  const bac = C.E.bac;
  const [selectedDay, setSelectedDay] = useState(st);
  const days = [];
  for (let day = lo; day < hi; day += 7) days.push(day);
  days.push(hi);

  const pvAt = (day) =>
    C.tx.reduce(
      (sum, task) =>
        sum +
        task.cost *
          Math.min(1, Math.max(0, (day - C.B.S[task.id] + 1) / task.dur)),
      0,
    );
  const acAt = (day) =>
    db.expenses.reduce(
      (sum, expense) => (D(expense.date) <= day ? sum + expense.amount : sum),
      0,
    );
  const acDays = [...days.filter((day) => day <= st), st]
    .filter((day, index, dates) => dates.indexOf(day) === index)
    .sort((a, b) => a - b);
  const top = Math.max(bac, C.budget, C.total, C.E.eac) * 1.08;
  const W = 760;
  const H = 310;
  const L = 56;
  const R = 18;
  const Tp = 14;
  const Bt = 34;
  const x = (day) => L + ((day - lo) / (hi - lo)) * (W - L - R);
  const y = (value) => H - Bt - (value / top) * (H - Bt - Tp);
  const path = (dates, valueAt) =>
    dates
      .map(
        (day, index) =>
          (index ? "L" : "M") +
          x(day).toFixed(1) +
          " " +
          y(valueAt(day)).toFixed(1),
      )
      .join(" ");
  const startDate = new Date(lo * 864e5);
  const months = [];
  for (let month = 1; ; month++) {
    const day =
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + month, 1) /
      864e5;
    if (day > hi) break;
    months.push(day);
  }

  const inspectPointer = (event) => {
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgX = point.matrixTransform(svg.getScreenCTM().inverse()).x;
    const day = lo + ((svgX - L) / (W - L - R)) * (hi - lo);
    setSelectedDay(Math.round(Math.min(hi, Math.max(lo, day))));
  };
  const selectedPv = pvAt(selectedDay);
  const selectedAc = acAt(selectedDay);

  return (
    <div className="card">
      <svg
        className="svgc graph-inspect"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Cumulative planned value versus actual cost over time. Move across the chart to inspect values."
        onPointerMove={inspectPointer}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((k) => (
          <g key={k}>
            <line
              className="grid-l"
              x1={L}
              x2={W - R}
              y1={y(k * top)}
              y2={y(k * top)}
            />
            <text x={L - 8} y={y(k * top) + 4} textAnchor="end">
              {((k * top) / 1e6).toFixed(1)}M
            </text>
          </g>
        ))}
        {months.map((month) => (
          <text key={month} x={x(month)} y={H - 12} textAnchor="middle">
            {MONTHS[new Date(month * 864e5).getUTCMonth()]}
          </text>
        ))}
        <line className="l-bac" x1={L} x2={W - R} y1={y(bac)} y2={y(bac)} />
        <text x={W - R} y={y(bac) - 5} textAnchor="end">
          Budget at completion {M(bac)}
        </text>
        <line className="l-dl" x1={x(C.dl)} x2={x(C.dl)} y1={Tp} y2={H - Bt} />
        <line className="l-st" x1={x(st)} x2={x(st)} y1={Tp} y2={H - Bt} />
        <line
          className="l-cursor"
          x1={x(selectedDay)}
          x2={x(selectedDay)}
          y1={Tp}
          y2={H - Bt}
        />
        <path className="l-pv" d={path(days, pvAt)} />
        <path className="l-ac" d={path(acDays, acAt)} />
        <circle className="pt-ev" cx={x(st)} cy={y(C.E.ev)} r="6" />
        <circle
          className="pt-pv"
          cx={x(selectedDay)}
          cy={y(selectedPv)}
          r="5"
        />
        {selectedDay <= st && (
          <circle
            className="pt-ac"
            cx={x(selectedDay)}
            cy={y(selectedAc)}
            r="5"
          />
        )}
      </svg>
      <div className="graph-inspector">
        <label>
          Inspect date: <b>{F(selectedDay)}</b>
          <input
            type="range"
            min={lo}
            max={hi}
            step="1"
            value={selectedDay}
            aria-label="Inspect graph values by date"
            onChange={(event) => setSelectedDay(Number(event.target.value))}
          />
        </label>
        <div className="graph-values" aria-live="polite">
          <span>
            Planned value <b>{M(selectedPv)}</b>
          </span>
          <span>
            Actual cost <b>{M(selectedAc)}</b>
            {selectedDay > st && <small> (through status date)</small>}
          </span>
        </div>
      </div>
      <div className="legend">
        <span>
          <i style={{ background: "var(--pv)" }} />
          Planned value <b>{M(C.E.pv)}</b> at status date
        </span>
        <span>
          <i style={{ background: "var(--acx)" }} />
          Actual cost <b>{M(C.E.ac)}</b>
        </span>
        <span>
          <i style={{ background: "var(--ev)", borderRadius: "50%" }} />
          Earned value <b>{M(C.E.ev)}</b>
        </span>
        <span>
          <i style={{ background: "var(--wn)" }} />
          Status date
        </span>
        <span>
          <i style={{ background: "var(--bad)" }} />
          Approved deadline
        </span>
      </div>
    </div>
  );
}

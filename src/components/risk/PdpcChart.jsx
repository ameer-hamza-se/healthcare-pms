// Structured risk-response view: goal > potential problem > preventive action > corrective action.
export default function PdpcChart({ ranked }) {
  return ranked.map((r) => (
    <div className="pd" key={r.id}>
      <div><small>Goal</small>Deliver within 16 weeks</div>
      <div><small>Potential problem (score {r.score})</small>{r.desc}</div>
      <div><small>Preventive action</small>{r.prev}</div>
      <div><small>Corrective action</small>{r.corr}</div>
    </div>
  ));
}

export default function DelayImpact({ C }) {
  if (!C.delayed.length) return <p className="ok">No delayed activities.</p>;
  return C.delayed.map((t) => (
    <div key={t.id} className="w c">
      {t.id} {t.name} is late by {t.days} day(s). Delays: {t.imp.join(', ') || 'no direct successors'}. Shifted activities: {C.impacted.join(', ')}.
    </div>
  ));
}

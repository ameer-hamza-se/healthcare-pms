const LEVELS = [1, 2, 3, 4, 5];
const shade = (s) => (s >= 15 ? 'rgba(220,38,38,.22)' : s >= 8 ? 'rgba(217,119,6,.22)' : 'rgba(22,163,74,.2)');

export default function PrioritizationMatrix({ ranked }) {
  return (
    <div className="mx">
      <div className="h" />
      {LEVELS.map((i) => <div key={i} className="h">Impact {i}</div>)}
      {[...LEVELS].reverse().flatMap((l) => [
        <div key={'l' + l} className="h">Likelihood {l}</div>,
        ...LEVELS.map((i) => (
          <div key={l + '-' + i} style={{ background: shade(l * i) }}>{ranked.filter((r) => r.lik === l && r.imp === i).map((r) => <span key={r.id} className="rchip" title={r.desc}>{r.id}</span>)}</div>
        )),
      ])}
    </div>
  );
}

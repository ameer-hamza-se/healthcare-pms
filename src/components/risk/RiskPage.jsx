import RiskRegister from './RiskRegister.jsx';
import PrioritizationMatrix from './PrioritizationMatrix.jsx';
import PdpcChart from './PdpcChart.jsx';

export default function RiskPage({ p }) {
  // Rank by score = likelihood x impact (highest first).
  const ranked = p.db.risks.map((r) => ({ ...r, score: r.lik * r.imp })).sort((a, b) => b.score - a.score);
  return (
    <div>
      <h2>Risk register</h2><RiskRegister p={p} ranked={ranked} />
      <h2>Prioritization matrix (likelihood × impact)</h2><PrioritizationMatrix ranked={ranked} />
      <h2>Process Decision Program Chart (ranked by score)</h2><PdpcChart ranked={ranked} />
    </div>
  );
}

import DefectTracker from './DefectTracker.jsx';
import QualityChecklist from './QualityChecklist.jsx';

export default function QualityPage({ p }) {
  return (
    <div>
      <h2>Defect tracking</h2><DefectTracker p={p} />
      <h2>Quality checklist and inspection results</h2><QualityChecklist p={p} />
    </div>
  );
}

import RequirementsTable from './RequirementsTable.jsx';
import ChangeRequests from './ChangeRequests.jsx';
import ScopeBaselines from './ScopeBaselines.jsx';
import TraceabilityMatrix from './TraceabilityMatrix.jsx';
import WbsTree from './WbsTree.jsx';
import ScopeLog from './ScopeLog.jsx';

export default function ScopePage({ p }) {
  return (
    <div>
      <h2>Requirements</h2><RequirementsTable p={p} />
      <h2>Change control</h2><ChangeRequests p={p} />
      <h2>Scope baselines</h2><ScopeBaselines p={p} />
      <h2>Requirements traceability</h2><TraceabilityMatrix p={p} />
      <h2>Work Breakdown Structure</h2><WbsTree db={p.db} />
      <h2>Scope change log</h2><ScopeLog db={p.db} />
    </div>
  );
}

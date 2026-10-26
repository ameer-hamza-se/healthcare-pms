import CharterForm from './CharterForm.jsx';
import PlanForm from './PlanForm.jsx';
import Milestones from './Milestones.jsx';
import TeamTable from './TeamTable.jsx';
import ClosurePanel from './ClosurePanel.jsx';

export default function CharterPage({ p }) {
  return (
    <div>
      <h2>Project charter</h2><CharterForm p={p} />
      <h2>Project management plan</h2><PlanForm p={p} />
      <h2>Milestones</h2><Milestones p={p} />
      <h2>Responsibilities</h2><TeamTable p={p} />
      <h2>Project closure</h2><ClosurePanel p={p} />
    </div>
  );
}

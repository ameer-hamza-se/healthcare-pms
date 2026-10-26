import { useState } from 'react';
import { OPEN_CR } from '../../../shared/logic.js';
import ChangeRequestForm from './ChangeRequestForm.jsx';
import ChangeRequestTable from './ChangeRequestTable.jsx';
import DecisionPanel from './DecisionPanel.jsx';
import ImpactPreview from './ImpactPreview.jsx';

// Workflow: submit -> review (impact analysis) -> approve or reject (approver, date and reason recorded).
export default function ChangeRequests({ p }) {
  const open = p.db.crs.filter((x) => OPEN_CR.includes(x.status));
  const [sel, setSel] = useState('');
  const current = open.some((x) => x.id === sel) ? sel : open[0]?.id || '';
  return (
    <>
      <ChangeRequestForm p={p} />
      <h3>Change register</h3>
      <ChangeRequestTable p={p} />
      <DecisionPanel p={p} open={open} sel={current} setSel={setSel} />
      <ImpactPreview p={p} id={current} />
    </>
  );
}

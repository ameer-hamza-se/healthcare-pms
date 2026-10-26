// Colour-coded status pill. toneOf() maps common status words to a tone.
const TONES = {
  Approved: 'ok', Pass: 'ok', Resolved: 'ok', Closed: 'ok', Yes: 'ok', Done: 'ok',
  Rejected: 'bad', Fail: 'bad', Critical: 'bad', Open: 'bad', 'Over plan': 'bad',
  Proposed: 'info', Submitted: 'info', 'Under Review': 'warn', 'In Progress': 'warn', High: 'warn',
  Pending: 'neutral', Medium: 'neutral', Low: 'neutral', No: 'neutral',
};
export const toneOf = (v) => TONES[v] || '';

export default function Badge({ tone = 'neutral', children }) {
  return <span className={'badge tone-' + tone}>{children}</span>;
}

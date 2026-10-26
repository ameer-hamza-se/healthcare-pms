export default function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null;
}

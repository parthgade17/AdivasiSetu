import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastState } = useApp();
  if (!toastState) return null;
  return <div className={`toast toast-${toastState.kind}`} role="status">{toastState.msg}</div>;
}

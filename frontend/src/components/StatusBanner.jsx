export default function StatusBanner({ type = 'info', children }) {
  if (!children) return null;

  return <div className={`status-banner status-banner--${type}`}>{children}</div>;
}

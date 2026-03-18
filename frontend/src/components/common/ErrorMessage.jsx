export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="error-banner">
      <span>⚠</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="btn-ghost" style={{ padding: '0 4px', color: 'var(--color-danger)' }}>
          ✕
        </button>
      )}
    </div>
  );
}

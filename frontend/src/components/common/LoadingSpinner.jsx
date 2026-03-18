export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

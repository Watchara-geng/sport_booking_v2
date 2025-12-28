export default function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-4 border-red-200 dark:border-red-900">
      <div className="text-red-600 dark:text-red-300 text-sm">{message}</div>
      {onRetry && <button className="btn btn-outline mt-3" onClick={onRetry}>Retry</button>}
    </div>
  );
}

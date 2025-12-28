export default function StatusBadge({ status }: { status: 'pending'|'confirmed'|'cancelled' }) {
  const map: Record<string, string> = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled'
  };
  return <span className={map[status]}>{status}</span>;
}

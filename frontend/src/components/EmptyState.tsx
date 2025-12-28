import { CalendarX } from 'lucide-react';

export default function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="card p-8 flex flex-col items-center text-center">
      <CalendarX className="mb-3 opacity-70" />
      <h3 className="font-semibold mb-2">{title}</h3>
      {action}
    </div>
  );
}

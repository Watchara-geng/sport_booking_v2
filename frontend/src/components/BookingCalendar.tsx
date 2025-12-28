import { useQuery } from '@tanstack/react-query';
import api from '@api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useState } from 'react';

type Slot = { startTime: string; endTime: string };

export default function BookingCalendar({ fieldId, onSelect }: { fieldId: string; onSelect: (start: Date, end: Date) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const availability = useQuery({
    queryKey: ['availability', fieldId, selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const r = await api.get(`/api/bookings/availability?fieldId=${fieldId}&date=${dateStr}`);
      return r.data.data.slots as Slot[];
    },
    enabled: !!fieldId
  });

  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8:00 - 20:00
  const bookedRanges = availability.data?.map(s => [new Date(s.startTime).getTime(), new Date(s.endTime).getTime()]) || [];

  const isBooked = (start: Date, end: Date) => {
    const st = start.getTime();
    const et = end.getTime();
    return bookedRanges.some(([bs, be]) => st < be && et > bs);
  };

  return (
    <div className="space-y-4">
      <DatePicker
        selected={selectedDate}
        onChange={date => setSelectedDate(date!)}
        dateFormat="yyyy-MM-dd"
        className="input"
      />

      <div className="grid grid-cols-2 gap-2">
        {hours.map(h => {
          const start = new Date(selectedDate);
          start.setHours(h, 0, 0, 0);
          const end = new Date(start);
          end.setHours(h + 1);

          const booked = isBooked(start, end);
          return (
            <button
              key={h}
              disabled={booked}
              onClick={() => onSelect(start, end)}
              className={`btn ${booked ? 'btn-disabled' : 'btn-outline'}`}
            >
              {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

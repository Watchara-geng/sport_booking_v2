import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@api/axios';
import StatusBadge from '@components/StatusBadge';
import { useState } from 'react';

type Item = {
  id: string;
  status: 'pending'|'confirmed'|'cancelled';
  amount: number;
  field: { name: string; branch: { name: string } };
  slots: { startTime: string; endTime: string }[];
};

export default function AdminBookings() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<'pending'|'confirmed'|'cancelled'|'all'>('all');

  const data = useQuery({
    queryKey: ['adminBookings', status],
    queryFn: async () => {
      // ใช้ /api/bookings/my แทนชั่วคราว ถ้าต้องการทั้งหมด สร้าง endpoint แยกภายหลัง
      const r = await api.get('/api/bookings/my', { params: { status: status === 'all' ? undefined : status } });
      return r.data.data as { items: Item[] };
    }
  });

  const update = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'confirmed'|'cancelled'; reason?: string }) => {
      const r = await api.patch(`/api/bookings/${id}/status`, { status, reason });
      return r.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminBookings'] })
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin — จัดการการจอง</h1>

      <div className="flex gap-2">
        {(['all','pending','confirmed','cancelled'] as const).map(s=>(
          <button key={s} onClick={()=>setStatus(s)} className={`btn ${status===s?'btn-primary':'btn-outline'}`}>{s}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>เวลา</th>
              <th>สนาม</th>
              <th>สถานะ</th>
              <th>จำนวนเงิน</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.isLoading && [...Array(5)].map((_,i)=>(<tr key={i}><td colSpan={5}><div className="h-8 skeleton"/></td></tr>))}
            {data.data?.items.map(b=>(
              <tr key={b.id}>
                <td>{b.slots[0] ? new Date(b.slots[0].startTime).toLocaleString() : '-'}</td>
                <td>{b.field?.name} <span className="text-xs text-gray-500">({b.field?.branch?.name})</span></td>
                <td><StatusBadge status={b.status}/></td>
                <td>{b.amount.toLocaleString()} บาท</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline" onClick={()=>update.mutate({ id: b.id, status: 'confirmed' })}>ยืนยัน</button>
                    <button className="btn btn-outline" onClick={()=>update.mutate({ id: b.id, status: 'cancelled' })}>ยกเลิก</button>
                  </div>
                </td>
              </tr>
            ))}
            {!data.isLoading && (data.data?.items.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="text-center p-6 text-sm text-gray-500">ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

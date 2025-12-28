import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@api/axios";
import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@components/StatusBadge";
import QRPreview from "@components/QRPreview";
import BookingCalendar from "@components/BookingCalendar";

type Branch = { id: string; name: string };
type Field = { id: string; name: string; branch?: Branch };
type Slot = { id: string; startTime: string; endTime: string };
type Booking = {
  id: string;
  field: Field;
  slots: Slot[];
  status: "pending" | "confirmed" | "cancelled";
  amount: number;
  promptPayQrUrl?: string | null;
  createdAt: string;
};

function roundToNextHour(d = new Date()) {
  const t = new Date(d);
  t.setMinutes(0, 0, 0);
  t.setHours(t.getHours() + 1);
  return t;
}

export default function Bookings() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  // ===== Default values =====
  const defaultStart = useMemo(() => roundToNextHour(), []);
  const defaultEnd = useMemo(() => {
    const e = new Date(defaultStart);
    e.setHours(e.getHours() + 1);
    return e;
  }, [defaultStart]);

  // ===== Optional: load fields for dropdown (if backend exposes /api/fields) =====
  const fields = useQuery({
    queryKey: ["fields"],
    queryFn: async () => {
      // ปรับ endpoint ตามจริงของคุณ ถ้ามี query params ก็เพิ่มได้
      const r = await api.get("/api/fields").catch(() => null);
      // รองรับหลายรูปแบบ data
      const items: Field[] =
        (r?.data?.data?.items as Field[]) ||
        (r?.data?.items as Field[]) ||
        (Array.isArray(r?.data?.data) ? r?.data?.data : []) ||
        [];
      return items;
    },
    // ถ้าไม่มี endpoint จะ error ให้เงียบไปเลย
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  // ===== Bookings of current user =====
  const bookings = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const r = await api.get("/api/bookings/my");
      return r.data.data as { items: Booking[] };
    },
  });

  // ===== Form state with defaults =====
  const [form, setForm] = useState({
    fieldId: "", // จะตั้ง default จาก fields ด้านล่าง
    amount: 300,
    startTime: defaultStart.toISOString(),
    endTime: defaultEnd.toISOString(),
  });

  // เมื่อโหลด fields สำเร็จ ให้ตั้งค่า fieldId อันแรกเป็นค่า default (ครั้งเดียว)
  useEffect(() => {
    if (fields.data && fields.data.length > 0 && !form.fieldId) {
      setForm((f) => ({ ...f, fieldId: fields.data![0].id }));
    }
  }, [fields.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Mutations =====
  const createMutation = useMutation({
    mutationFn: async (payload: {
      fieldId: string;
      amount: number;
      startTime: string;
      endTime: string;
    }) => {
      const r = await api.post("/api/bookings", payload);
      return r.data.data as Booking;
    },
    onSuccess: (b) => {
      setQr(b.promptPayQrUrl || null);
      qc.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await api.patch(`/api/bookings/cancel/${id}`);
      return r.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myBookings"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">การจองของฉัน</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setQr(null);
            setDialogOpen(true);
          }}
        >
          จองสนาม
        </button>
      </div>

      {/* ตารางรายการ */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>เวลา</th>
              <th>สนาม</th>
              <th>สถานะ</th>
              <th>จำนวนเงิน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.isLoading &&
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5}>
                    <div className="h-8 skeleton" />
                  </td>
                </tr>
              ))}
            {!bookings.isLoading &&
              (bookings.data?.items.length ?? 0) === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-6 text-sm text-gray-500"
                  >
                    ยังไม่มีการจอง
                  </td>
                </tr>
              )}
            {bookings.data?.items.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
              >
                <td className="whitespace-nowrap">
                  {b.slots[0]
                    ? new Date(b.slots[0].startTime).toLocaleString()
                    : "-"}
                </td>
                <td>
                  {b.field?.name}{" "}
                  <span className="text-xs text-gray-500">
                    ({b.field?.branch?.name})
                  </span>
                </td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
                <td>{b.amount.toLocaleString()} บาท</td>
                <td className="text-right">
                  {b.status === "pending" && (
                    <button
                      className="btn btn-outline"
                      onClick={() => cancelMutation.mutate(b.id)}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "กำลังยกเลิก…" : "ยกเลิก"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog จองสนาม */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="card w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">จองสนาม</h2>
              <button
                className="btn btn-outline"
                onClick={() => setDialogOpen(false)}
              >
                ปิด
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">สนาม</label>
                {fields.data && fields.data.length > 0 ? (
                  <select
                    className="input"
                    value={form.fieldId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fieldId: e.target.value }))
                    }
                  >
                    {fields.data.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                        {f.branch?.name ? ` — ${f.branch.name}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      className="input"
                      value={form.fieldId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fieldId: e.target.value }))
                      }
                      placeholder="ใส่ fieldId จากฐานข้อมูล (ยังไม่มี endpoint /api/fields)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      * ยังไม่มีรายการสนามจาก API จึงให้กรอก fieldId เอง
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="label">จำนวนเงิน (บาท)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      amount: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">เวลาเริ่ม (ISO)</label>
                  <input
                    className="input"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                    placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ค่าเริ่มต้น: {new Date(form.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="label">เวลาสิ้นสุด (ISO)</label>
                  <input
                    className="input"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                    placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ค่าเริ่มต้น: {new Date(form.endTime).toLocaleString()}
                  </p>
                </div>
              </div> */}
            
                <BookingCalendar
                    fieldId={form.fieldId}
                    onSelect={(start, end) => {
                        setForm(f => ({ ...f, startTime: start.toISOString(), endTime: end.toISOString() }));
                    }}
                />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  setQr(null);
                  const r = await createMutation.mutateAsync(form);
                  setQr(r.promptPayQrUrl || null);
                }}
                disabled={
                  createMutation.isPending ||
                  !form.fieldId ||
                  !form.startTime ||
                  !form.endTime ||
                  form.amount <= 0
                }
                title={!form.fieldId ? "กรุณาเลือก/กรอกสนามก่อน" : undefined}
              >
                {createMutation.isPending
                  ? "กำลังสร้าง…"
                  : "สร้างการจอง & แสดง QR"}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setDialogOpen(false)}
              >
                ปิด
              </button>
            </div>

            <QRPreview dataUrl={qr} />
          </div>
        </div>
      )}
    </div>
  );
}

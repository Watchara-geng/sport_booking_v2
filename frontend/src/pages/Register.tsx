import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const { register: f, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const { register: registerFn } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">สมัครสมาชิก</h1>
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      <form
        onSubmit={handleSubmit(async (v) => {
          setErr(null);
          try {
            await registerFn(v.name, v.email, v.password);
            nav('/');
          } catch (e: any) {
            setErr(e?.response?.data?.message || 'Register failed');
          }
        })}
        className="space-y-4"
      >
        <div>
          <label className="label">ชื่อ</label>
          <input className="input" {...f('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">อีเมล</label>
          <input className="input" {...f('email')} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">รหัสผ่าน</label>
          <input className="input" type="password" {...f('password')} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <button className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
        </button>
        <p className="text-xs text-gray-500">
          มีบัญชีแล้ว? <Link to="/login" className="underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}

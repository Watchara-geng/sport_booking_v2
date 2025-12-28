import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { register: f, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const { login } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">เข้าสู่ระบบ</h1>
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      <form
        onSubmit={handleSubmit(async (v) => {
          setErr(null);
          try {
            await login(v.email, v.password);
            nav('/');
          } catch (e: any) {
            setErr(e?.response?.data?.message || 'Login failed');
          }
        })}
        className="space-y-4"
      >
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
          {isSubmitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
        <p className="text-xs text-gray-500">
          ยังไม่มีบัญชี? <Link to="/register" className="underline">สมัครสมาชิก</Link>
        </p>
      </form>
    </div>
  );
}

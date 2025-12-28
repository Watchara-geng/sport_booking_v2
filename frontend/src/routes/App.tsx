// frontend/src/routes/App.tsx
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Bookings from '@pages/Bookings';
import AdminBookings from '@pages/AdminBookings';
import { useAuth } from '@context/AuthContext';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur z-20">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="font-semibold text-lg">⚽ Sports Booking</Link>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline" onClick={() => setDark(v => !v)} aria-label="toggle theme">
              {dark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            {user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">Hi, {user.name}</span>
                <button className="btn btn-outline" onClick={() => { logout(); nav('/login'); }}>
                  <LogOut size={16}/> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}

function Private({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Layout><Login/></Layout>} />
      <Route path="/register" element={<Layout><Register/></Layout>} />
      <Route path="/" element={<Layout><Private><Bookings/></Private></Layout>} />
      <Route path="/admin/bookings" element={<Layout><Private><AdminOnly><AdminBookings/></AdminOnly></Private></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

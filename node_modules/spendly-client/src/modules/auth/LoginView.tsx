import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginView: React.FC = () => {
  const location = useLocation();
  const initialEmail = (location.state as any)?.registeredEmail || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9ff]">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] p-8 rounded-3xl space-y-6 shadow-card">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#4648d4] text-white flex items-center justify-center shadow-md shadow-[#4648d4]/20 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0b1c30]">Sign in to Spendly</h1>
          <p className="text-xs text-[#464554]">Hostel & PG Expense Management Platform</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#464554] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#464554] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#767586] border-t border-slate-100 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#4648d4] font-bold hover:underline">
            Register Student Account
          </Link>
        </div>
      </div>
    </div>
  );
};

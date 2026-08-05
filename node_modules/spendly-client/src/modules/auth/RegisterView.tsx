import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterView: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: email } });
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register account.');
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
          <h1 className="font-display font-bold text-2xl text-[#0b1c30]">Register Account</h1>
          <p className="text-xs text-[#464554]">Join Spendly Hostel & PG Expense Platform</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#464554] block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#464554] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="rahul@domain.com"
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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#767586] border-t border-slate-100 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4648d4] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

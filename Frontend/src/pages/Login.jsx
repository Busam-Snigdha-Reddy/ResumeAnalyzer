import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!email || !password) {
      setErr('Please fill in all fields.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErr(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-2xl flex flex-col">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-center text-sm mb-8">Sign in to review and customize your resume analyses.</p>

        {err && (
          <div className="p-3 mb-6 border border-rose-950 bg-rose-950/20 text-rose-300 rounded-lg text-xs font-semibold">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="developer@example.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 mt-2 w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          New to ATS Pro?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

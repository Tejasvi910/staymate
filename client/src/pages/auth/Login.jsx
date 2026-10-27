import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  User,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from 'lucide-react';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier || !password) {
      setError('Please provide your campus email or roll number, and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedIdentifier, password);
    setIsSubmitting(false);

    if (result.success) {
      // Determine redirection based strictly on the user's authentic role
      const userRole = result.user?.role;
      if (from && !from.includes('/login')) {
        navigate(from, { replace: true });
      } else if (userRole === 'manager' || userRole === 'admin') {
        navigate('/admin/campuses', { replace: true });
      } else if (userRole === 'warden') {
        navigate('/warden/dashboard', { replace: true });
      } else if (userRole === 'accountant') {
        navigate('/accounts/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Invalid credentials. Please verify your details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            StayMate <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Sign In to StayMate AI
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Single login for Students, Hostel Wardens, Accounts & Campus Administration.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl shadow-black/60 relative">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Error Alert Toast */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-lg shadow-rose-950/20">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="text-rose-400 hover:text-rose-200 transition p-0.5"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Identifier (Email or Roll Number) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address or Roll Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Staff use campus email; students can use either email or roll number.
              </p>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-950/70 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Administrative Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>Student admissions & accounts are managed by your </span>
            <span className="font-semibold text-indigo-400">Campus Warden & Administration</span>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

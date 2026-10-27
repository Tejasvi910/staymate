import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, Mail, Lock, User, Hash, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    contactNumber: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.rollNumber) {
      setError('Please fill in all required fields (Name, Email, Password, Roll Number).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      ...formData,
      role: 'student',
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/student/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            StayMate <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create Student Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Join the campus hostel and mess management ecosystem
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-700/70 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Campus Email *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-700/70 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Roll Number & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Roll Number *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm uppercase bg-slate-950/70 border border-slate-700/70 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-700/70 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password (min 6 characters) *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-700/70 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

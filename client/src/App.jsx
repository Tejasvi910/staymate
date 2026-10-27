import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Manager Pages
import ManagerCampuses from './pages/admin/ManagerCampuses';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminMess from './pages/admin/AdminMess';
import AdminNotices from './pages/admin/AdminNotices';

// Warden Pages
import WardenDashboard from './pages/warden/WardenDashboard';

// Accountant Pages
import AccountantDashboard from './pages/accounts/AccountantDashboard';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentRoom from './pages/student/StudentRoom';
import StudentMess from './pages/student/StudentMess';
import StudentComplaints from './pages/student/StudentComplaints';
import StudentAssistant from './pages/student/StudentAssistant';

// Icons
import {
  Bot,
  Building2,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  Shield,
  Coins,
} from 'lucide-react';

// Landing Page for Unauthenticated Guests
function PublicLanding() {
  const { isAuthenticated, isManager, isWarden, isAccountant, isStudent } = useAuth();

  if (isAuthenticated) {
    if (isManager) return <Navigate to="/admin/campuses" replace />;
    if (isWarden) return <Navigate to="/warden/dashboard" replace />;
    if (isAccountant) return <Navigate to="/accounts/dashboard" replace />;
    if (isStudent) return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              StayMate<span className="text-indigo-400"> AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition"
            >
              Student Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-28 lg:pb-32 text-center px-4">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Multi-Campus Living, Staff Rosters & Accounts Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Multi-Campus Operations, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400">
                Tailored for Every Campus Role.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
              Centralized branch management for Managers, on-duty staff and room allotments for Wardens, student fee ledgers for Accountants, and 24/7 AI living assistance for Students.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Launch Role Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
              >
                <span>Resident Student Sign Up</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Roles Feature Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Campus Manager</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized multi-campus operational grid with branch analytics, occupancy, and collection rates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Hostel Warden</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Floor bed allotments, caretaker shifts, security logs, and AI maintenance ticket triage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Accountant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student fee ledger, installment payments, pending due reminders, and printable vouchers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Resident Student</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Roommate specs, semester fee status, daily dining menus, and Gemini AI assistant.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © 2026 StayMate AI – Multi-Campus Living & Administration Platform.
      </footer>
    </div>
  );
}

// Public Auth Route Guard (Redirects to role dashboard if already authenticated)
function PublicAuthRoute({ children }) {
  const { isAuthenticated, isManager, isWarden, isAccountant, isStudent } = useAuth();
  if (isAuthenticated) {
    if (isManager) return <Navigate to="/admin/campuses" replace />;
    if (isWarden) return <Navigate to="/warden/dashboard" replace />;
    if (isAccountant) return <Navigate to="/accounts/dashboard" replace />;
    if (isStudent) return <Navigate to="/student/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<PublicLanding />} />
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicAuthRoute>
                <Register />
              </PublicAuthRoute>
            }
          />

          {/* Manager Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/campuses" replace />} />
            <Route path="campuses" element={<ManagerCampuses />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="mess" element={<AdminMess />} />
            <Route path="notices" element={<AdminNotices />} />
          </Route>

          {/* Warden Protected Routes */}
          <Route
            path="/warden"
            element={
              <ProtectedRoute allowedRoles={['warden', 'manager', 'admin']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/warden/dashboard" replace />} />
            <Route path="dashboard" element={<WardenDashboard />} />
            <Route path="staff" element={<WardenDashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="mess" element={<AdminMess />} />
          </Route>

          {/* Accountant Protected Routes */}
          <Route
            path="/accounts"
            element={
              <ProtectedRoute allowedRoles={['accountant', 'manager', 'admin']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/accounts/dashboard" replace />} />
            <Route path="dashboard" element={<AccountantDashboard />} />
            <Route path="fees" element={<AccountantDashboard />} />
            <Route path="dues" element={<AccountantDashboard />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="room" element={<StudentRoom />} />
            <Route path="mess" element={<StudentMess />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="assistant" element={<StudentAssistant />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

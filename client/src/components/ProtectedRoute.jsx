import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 mb-4 animate-pulse">
          <Bot className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Verifying campus credentials...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles specified and user role not permitted
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'manager' || user?.role === 'admin') {
      return <Navigate to="/admin/campuses" replace />;
    }
    if (user?.role === 'warden') {
      return <Navigate to="/warden/dashboard" replace />;
    }
    if (user?.role === 'accountant') {
      return <Navigate to="/accounts/dashboard" replace />;
    }
    if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

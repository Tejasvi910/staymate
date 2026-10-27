import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, LogOut, Menu, X, Shield, User as UserIcon, Building2, Coins } from 'lucide-react';

export const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout, isManager, isWarden, isAccountant, isStudent } = useAuth();

  // Role Badge Config
  const getRoleBadge = () => {
    if (isManager) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>General Manager</span>
        </div>
      );
    }
    if (isWarden) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Hostel Warden</span>
        </div>
      );
    }
    if (isAccountant) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>Accounts & Fee Admin</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
        <UserIcon className="w-3.5 h-3.5 text-sky-400" />
        <span>Student {user?.rollNumber ? `(${user.rollNumber})` : ''}</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 h-16 flex items-center px-4 sm:px-6 justify-between">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden transition"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-md shadow-indigo-600/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              StayMate <span className="text-indigo-400 text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Smart Campus Living Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Campus indicator if user has campus */}
        {user?.campus?.name && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{user.campus.name}</span>
          </div>
        )}

        {/* Role Badge */}
        <div className="hidden sm:flex items-center">
          {getRoleBadge()}
        </div>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-slate-700 ring-2 ring-indigo-500/20"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.name || 'Campus Resident'}
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

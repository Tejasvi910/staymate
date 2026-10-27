import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  UtensilsCrossed,
  AlertCircle,
  Bot,
  Bell,
  Sparkles,
  ChevronRight,
  Shield,
  Coins,
  Users,
} from 'lucide-react';

export const Sidebar = ({ sidebarOpen, closeSidebar }) => {
  const { user, isManager, isWarden, isAccountant } = useAuth();

  // 1. Manager Navigation Links
  const managerLinks = [
    { name: 'Multi-Campus Grid', to: '/admin/campuses', icon: Building2 },
    { name: 'Global Analytics', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hostel Rooms', to: '/admin/rooms', icon: Building2 },
    { name: 'All Grievances', to: '/admin/complaints', icon: AlertCircle },
    { name: 'Mess & Headcount', to: '/admin/mess', icon: UtensilsCrossed },
    { name: 'Campus Bulletins', to: '/admin/notices', icon: Bell },
  ];

  // 2. Warden Navigation Links
  const wardenLinks = [
    { name: 'Warden Dashboard', to: '/warden/dashboard', icon: LayoutDashboard },
    { name: 'Staff Roster', to: '/warden/staff', icon: Users },
    { name: 'Room Allotment', to: '/warden/rooms', icon: Building2 },
    { name: 'Student Grievances', to: '/warden/complaints', icon: AlertCircle },
    { name: 'Mess Operations', to: '/warden/mess', icon: UtensilsCrossed },
  ];

  // 3. Accountant Navigation Links
  const accountantLinks = [
    { name: 'Accounts Overview', to: '/accounts/dashboard', icon: LayoutDashboard },
    { name: 'Student Fee Ledger', to: '/accounts/fees', icon: Coins },
    { name: 'Fee Reminders', to: '/accounts/dues', icon: Bell },
  ];

  // 4. Student Navigation Links
  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Room', to: '/student/room', icon: Building2 },
    { name: 'Mess Schedule', to: '/student/mess', icon: UtensilsCrossed },
    { name: 'File Complaint', to: '/student/complaints', icon: AlertCircle },
    { name: 'AI Assistant', to: '/student/assistant', icon: Bot, isAi: true },
  ];

  let links = studentLinks;
  let portalTitle = 'Campus Resident Portal';

  if (isManager) {
    links = managerLinks;
    portalTitle = 'HQ Multi-Campus Portal';
  } else if (isWarden) {
    links = wardenLinks;
    portalTitle = 'Hostel Warden Operations';
  } else if (isAccountant) {
    links = accountantLinks;
    portalTitle = 'Finance & Accounts Ledger';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Header */}
        <div className="p-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {portalTitle}
        </div>

        {/* Links List */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-white'
                            : link.isAi
                            ? 'text-indigo-400 group-hover:text-indigo-300'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{link.name}</span>
                    </div>

                    {link.isAi && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}

                    {!link.isAi && isActive && (
                      <ChevronRight className="w-4 h-4 text-white/70" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom AI Status Card */}
        <div className="p-3 m-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">Gemini AI Engine Active</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Multi-Campus analytics & predictive triage online.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  UtensilsCrossed,
  AlertCircle,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  Bell,
  Pin,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [roomRes, compRes, notRes, messRes] = await Promise.allSettled([
          api.get('/rooms/my-room'),
          api.get('/complaints'),
          api.get('/notices'),
          api.get(`/mess?dayOfWeek=${todayName}`),
        ]);

        if (roomRes.status === 'fulfilled') setRoomData(roomRes.value.data);
        if (compRes.status === 'fulfilled') setComplaints(compRes.value.data.complaints || []);
        if (notRes.status === 'fulfilled') setNotices(notRes.value.data.notices || []);
        if (messRes.status === 'fulfilled') setTodayMeals(messRes.value.data.menus || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [todayName]);

  // Determine current active/next meal slot based on current hour
  const getCurrentMeal = () => {
    const currentHour = new Date().getHours();
    let targetSlot = 'Dinner';

    if (currentHour < 10) targetSlot = 'Breakfast';
    else if (currentHour < 15) targetSlot = 'Lunch';
    else if (currentHour < 18) targetSlot = 'Snacks';
    else targetSlot = 'Dinner';

    const match = todayMeals.find((m) => m.mealType === targetSlot);
    return match || { mealType: targetSlot, items: ['Regular hostel menu'], timings: { start: '7:30 PM', end: '9:30 PM' } };
  };

  const activeMeal = getCurrentMeal();
  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const latestNotice = notices[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Resident Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Hello, {user?.name || 'Student'}!
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Roll No: <span className="text-slate-200 font-mono font-medium">{user?.rollNumber || 'CS202501'}</span> •{' '}
              {todayName}, {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/assistant"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Bot className="w-4 h-4" />
              <span>Ask StayMate AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Assigned Room */}
        <Link
          to="/student/room"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Allocated Room</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">
              {loading ? (
                <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
              ) : roomData?.assigned && roomData.room ? (
                roomData.room.roomNumber
              ) : (
                <span className="text-base text-amber-400 font-medium">Unallocated</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {roomData?.room ? `${roomData.room.block} • Floor ${roomData.room.floor}` : 'Pending assignment'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium mt-3 pt-2 border-t border-slate-800/80">
            <span>Room specifications</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* KPI 2: Today's Active Meal */}
        <Link
          to="/student/mess"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Next Meal</span>
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">
              {activeMeal.mealType}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {activeMeal.items?.slice(0, 2).join(', ') || 'Special Chef Menu'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-violet-400 font-medium mt-3 pt-2 border-t border-slate-800/80">
            <span>{activeMeal.timings?.start || '7:30 PM'} – {activeMeal.timings?.end || '9:30 PM'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* KPI 3: Open Grievances */}
        <Link
          to="/student/complaints"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Complaints</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2 flex items-center gap-2">
              {loading ? (
                <div className="h-7 w-12 bg-slate-800 animate-pulse rounded" />
              ) : (
                <span>{openComplaintsCount}</span>
              )}
              {openComplaintsCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  In Triage
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {openComplaintsCount === 0 ? 'All tickets resolved' : 'Pending maintenance'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium mt-3 pt-2 border-t border-slate-800/80">
            <span>Submit or track issue</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* KPI 4: Hostel Fee Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hostel Fee Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user?.feeStatus === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : user?.feeStatus === 'Partial'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}
              >
                {user?.feeStatus || 'Pending'}
              </span>
            </div>
            <div className="text-2xl font-black text-white mt-2">
              ₹{(user?.paidFee || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Total: ₹{(user?.totalFee || 65000).toLocaleString()}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Pending Due</span>
            <span className="font-bold text-amber-400">
              ₹{Math.max(0, (user?.totalFee || 65000) - (user?.paidFee || 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Campus Notices & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Campus Notices & Announcements */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Campus Notices & Announcements</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">Official Warden Bulletins</span>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-3">
              {notices.slice(0, 4).map((notice) => (
                <div
                  key={notice._id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Pin className="w-2.5 h-2.5" />
                          Pinned
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        notice.category === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : notice.category === 'Mess'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : notice.category === 'Maintenance'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {notice.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {notice.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Audience: {notice.targetAudience}</span>
                    <span>Posted {new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-950/40">
              No bulletins published currently.
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Campus Quick Hub & Regulations */}
        <div className="space-y-6">
          {/* Quick Action Shortcuts */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                to="/student/complaints"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-950 transition text-xs font-semibold text-slate-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Report Maintenance Grievance</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/student/mess"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-950 transition text-xs font-semibold text-slate-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <UtensilsCrossed className="w-4 h-4 text-violet-400" />
                  <span>View Weekly Mess Timetable</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/student/assistant"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-950 transition text-xs font-semibold text-slate-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-sky-400" />
                  <span>Ask Curfew / Gate Pass Rules</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Regulations Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Campus Hours & Curfew</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1">
              <span>Main Gate In-Time</span>
              <strong className="text-rose-400 font-mono">9:30 PM</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Night Gate Pass</span>
              <span className="text-slate-300">24 hrs prior notice</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Quiet Study Hours</span>
              <span className="text-emerald-400 font-mono">11 PM – 6 AM</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Warden Office</span>
              <span className="text-slate-300">Block A (Room 102)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

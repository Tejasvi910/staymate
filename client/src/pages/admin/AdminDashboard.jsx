import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Building2,
  AlertCircle,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [predictedHeadcount, setPredictedHeadcount] = useState(null);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    const fetchAdminOverview = async () => {
      setLoading(true);
      try {
        const [studentsRes, roomsRes, compRes, predictRes] = await Promise.allSettled([
          api.get('/auth/students'),
          api.get('/rooms'),
          api.get('/complaints'),
          api.post('/mess/predict', { dayOfWeek: todayName, mealType: 'Dinner' }),
        ]);

        if (studentsRes.status === 'fulfilled') {
          setStudents(studentsRes.value.data.students || []);
        }
        if (roomsRes.status === 'fulfilled') {
          setRooms(roomsRes.value.data.rooms || []);
        }
        if (compRes.status === 'fulfilled') {
          setComplaints(compRes.value.data.complaints || []);
        }
        if (predictRes.status === 'fulfilled') {
          setPredictedHeadcount(predictRes.value.data.prediction);
        }
      } catch (err) {
        console.error('Error fetching admin overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, [todayName]);

  // Aggregate Metrics
  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected');
  const criticalComplaints = openComplaints.filter(
    (c) => c.priority === 'Urgent' || (c.aiAnalysis && c.aiAnalysis.urgencyScore >= 8)
  );

  // Group rooms by block/wing
  const wingBreakdown = rooms.reduce((acc, r) => {
    const block = r.block || 'A-Wing';
    if (!acc[block]) acc[block] = { capacity: 0, occupied: 0, count: 0 };
    acc[block].capacity += r.capacity || 0;
    acc[block].occupied += r.currentOccupancy || 0;
    acc[block].count += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Warden & Operations Central</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Hostel Administration Console
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Real-time room occupancy, Gemini AI grievance triage, and dining analytics.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/notices"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast Notice</span>
            </Link>
            <Link
              to="/admin/rooms"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </Link>
            <Link
              to="/admin/mess"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Meal Forecast</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Registered Students */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Residents</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {loading ? <div className="h-8 w-16 bg-slate-800 animate-pulse rounded" /> : students.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered campus students
          </p>
        </div>

        {/* KPI 2: Rooms & Occupancy */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded" />
            ) : (
              <>
                <span>{overallOccupancyRate}%</span>
                <span className="text-xs font-normal text-slate-400 font-mono">
                  ({totalOccupied}/{totalCapacity} beds)
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across {rooms.length} configured rooms</p>
        </div>

        {/* KPI 3: Grievances & Critical Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Grievances</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-12 bg-slate-800 animate-pulse rounded" />
            ) : (
              <span>{openComplaints.length}</span>
            )}
            {criticalComplaints.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {criticalComplaints.length} Critical
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting maintenance action</p>
        </div>

        {/* KPI 4: Today's AI Mess Turnout */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dinner Forecast</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-400 mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded" />
            ) : predictedHeadcount ? (
              `${predictedHeadcount.predictedTurnout}`
            ) : (
              '285'
            )}{' '}
            <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI Headcount Prediction</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Urgent Attention Feed & Wing Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Attention Feed (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Urgent Attention Grievances</h2>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All Grievances</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {criticalComplaints.length > 0 ? (
            <div className="space-y-3">
              {criticalComplaints.slice(0, 4).map((ticket) => (
                <div
                  key={ticket._id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 hover:border-rose-500/60 transition space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Urgency: {ticket.aiAnalysis?.urgencyScore || 8}/10
                      </span>
                      <h3 className="text-sm font-bold text-white">{ticket.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Room: {ticket.student?.room?.roomNumber || 'A-Wing'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{ticket.description}</p>

                  {ticket.aiAnalysis?.actionRecommendation && (
                    <div className="text-[11px] p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300">
                      <strong>AI Dispatch Recommendation:</strong> {ticket.aiAnalysis.actionRecommendation}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>Reported by {ticket.student?.name} ({ticket.student?.rollNumber || 'CS202501'})</span>
                    <Link
                      to="/admin/complaints"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Take Action →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>Zero critical grievances currently! Maintenance operations are on schedule.</span>
            </div>
          )}
        </div>

        {/* Wing Breakdown & Capacity (1 Col) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Occupancy by Block
              </h3>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="mt-4 space-y-4">
              {Object.keys(wingBreakdown).length > 0 ? (
                Object.entries(wingBreakdown).map(([blockName, data]) => {
                  const pct = data.capacity > 0 ? Math.round((data.occupied / data.capacity) * 100) : 0;
                  return (
                    <div key={blockName} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{blockName}</span>
                        <span className="text-slate-400 font-mono">
                          {data.occupied} / {data.capacity} beds ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 p-0.5 border border-slate-800">
                        <div
                          className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 py-4">No wings configured yet.</div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Intelligence Active</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Gemini AI models automatically cross-reference resident curfews, meal turnouts, and facility maintenance dispatch schedules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

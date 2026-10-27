import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Users,
  Bed,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Phone,
  Mail,
  Hash,
  AlertCircle,
  Wifi,
  Fan,
  KeyRound,
  Wrench,
} from 'lucide-react';

export const StudentRoom = () => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyRoom = async () => {
      setLoading(true);
      try {
        const response = await api.get('/rooms/my-room');
        setRoomData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load room details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyRoom();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-medium">Retrieving your hostel room allocation...</span>
      </div>
    );
  }

  const room = roomData?.room;
  const isAssigned = roomData?.assigned && !!room;
  const occupancyPercentage = room ? Math.round((room.currentOccupancy / room.capacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hostel Living Quarters
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Room specifications, occupancy details, and roommate information.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {isAssigned ? (
        <>
          {/* Top Row: Room Specs & Status Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Room Badge */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                      room.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : room.status === 'full'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="mt-6">
                  <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    Assigned Unit
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">
                    Room {room.roomNumber}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    {room.block} • Floor {room.floor}
                  </p>
                </div>
              </div>

              {/* Occupancy Indicator */}
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
                  <span>Occupancy Status</span>
                  <span className="text-white font-bold">
                    {room.currentOccupancy} / {room.capacity} Residents ({occupancyPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Room Features & Amenities Specification */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Room Inventory & Amenities</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Bed className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Twin Beds</div>
                      <div className="text-[10px] text-slate-400">Mattress + Almirah</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Campus Wi-Fi</div>
                      <div className="text-[10px] text-slate-400">Gigabit Mesh AP</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Fan className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Power & Fan</div>
                      <div className="text-[10px] text-slate-400">24x7 Generator Backup</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Digital Lock</div>
                      <div className="text-[10px] text-slate-400">Keycard + Manual Key</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Balcony View</div>
                      <div className="text-[10px] text-slate-400">Campus Quadrangle</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Maintenance</div>
                      <div className="text-[10px] text-slate-400">Gemini AI Triage</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Callout */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-300">
                  <span className="font-semibold text-white">Experiencing an issue with your room fixtures?</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Submit an issue report; our maintenance squad dispatches rapidly.</p>
                </div>
                <Link
                  to="/student/complaints"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap shadow-md transition text-center"
                >
                  File Complaint
                </Link>
              </div>
            </div>
          </div>

          {/* Roommates Card Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  Co-Residents & Roommates ({roomData.roommates?.length || 0})
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Shared Quarters</span>
            </div>

            {roomData.roommates && roomData.roommates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomData.roommates.map((mate) => (
                  <div
                    key={mate._id}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition"
                  >
                    <img
                      src={
                        mate.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={mate.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700 ring-2 ring-indigo-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-bold text-white text-sm truncate">{mate.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono text-slate-300">{mate.rollNumber || 'CS202501'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{mate.email}</span>
                      </div>
                      {mate.contactNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-mono">{mate.contactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-sm">
                No roommates assigned currently. You currently have single occupancy in this room.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Bed className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Room Allocation Pending</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Your hostel room has not been assigned by the campus administration yet. Please contact the Chief Warden's Office in Block A or message the StayMate AI Assistant.
          </p>
          <div className="pt-2">
            <Link
              to="/student/assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition"
            >
              Contact Warden via Assistant
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRoom;

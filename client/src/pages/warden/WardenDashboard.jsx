import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Shield,
  Building2,
  Users,
  AlertCircle,
  Clock,
  Phone,
  CheckCircle2,
  Plus,
  Loader2,
  Sparkles,
  ArrowRight,
  UserCheck,
  UserPlus,
  ArrowLeftRight,
  X,
} from 'lucide-react';

export const WardenDashboard = () => {
  const { user } = useAuth();
  const [campusData, setCampusData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Student Modal (from unassigned pool)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [studentRoll, setStudentRoll] = useState('');
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Admit New Student Modal (Direct Campus Admission)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRollNumber, setStudentRollNumber] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentRoomId, setStudentRoomId] = useState('');
  const [studentTotalFee, setStudentTotalFee] = useState('60000');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Alter / Reallocate Room Modal
  const [showReallocateModal, setShowReallocateModal] = useState(false);
  const [reallocatingResident, setReallocatingResident] = useState(null);
  const [currentRoomObj, setCurrentRoomObj] = useState(null);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [isReallocating, setIsReallocating] = useState(false);

  // Add Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('Hostel Caretaker');
  const [staffShift, setStaffShift] = useState('Day (2 PM - 10 PM)');
  const [staffContact, setStaffContact] = useState('');

  const fetchWardenData = async () => {
    setLoading(true);
    try {
      // 1. Fetch campus details
      const campusId = user?.campus?._id || user?.campus;
      if (campusId) {
        const cRes = await api.get(`/campuses/${campusId}`);
        setCampusData(cRes.data.campus);
      } else {
        // Fallback: fetch first campus if user not yet linked
        const allC = await api.get('/campuses');
        if (allC.data.campuses?.length > 0) {
          const first = allC.data.campuses[0];
          const cRes = await api.get(`/campuses/${first._id}`);
          setCampusData(cRes.data.campus);
        }
      }

      // 2. Fetch rooms
      const rRes = await api.get('/rooms');
      setRooms(rRes.data.rooms || []);

      // 3. Fetch complaints
      const compRes = await api.get('/complaints');
      setComplaints(compRes.data.complaints || []);

      // 4. Fetch unassigned students for quick assignment
      const studRes = await api.get('/auth/students?unassigned=true');
      setUnassignedStudents(studRes.data.students || []);
    } catch (err) {
      console.error('Error fetching warden dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardenData();
  }, [user]);

  // Handle complaint status update
  const handleUpdateComplaint = async (complaintId, newStatus) => {
    try {
      await api.put(`/complaints/${complaintId}/status`, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle room assignment
  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !studentRoll) return;
    setIsAssigning(true);
    try {
      await api.put(`/rooms/${selectedRoom._id}/assign`, { rollNumber: studentRoll });
      setShowAssignModal(false);
      setStudentRoll('');
      fetchWardenData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign student');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle room unassign
  const handleUnassignStudent = async (roomId, studentId) => {
    if (!window.confirm('Are you sure you want to unassign this student from the room?')) return;
    try {
      await api.put(`/rooms/${roomId}/unassign`, { studentId });
      fetchWardenData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unassign student');
    }
  };

  // Handle Add Staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !campusData) return;
    try {
      await api.post(`/campuses/${campusData._id}/staff`, {
        name: staffName,
        designation: staffDesignation,
        shift: staffShift,
        contact: staffContact,
      });
      setShowAddStaffModal(false);
      setStaffName('');
      setStaffContact('');
      fetchWardenData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add staff member');
    }
  };

  // Handle Add Student (Direct Campus Admission by Warden)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !studentRollNumber) return;
    setIsSubmittingStudent(true);
    try {
      const activeCampusId = campusData?._id || user?.campus?._id || user?.campus;
      await api.post('/users/student', {
        name: studentName.trim(),
        email: studentEmail.trim(),
        rollNumber: studentRollNumber.trim(),
        campus: activeCampusId,
        room: studentRoomId || null,
        contactNumber: studentContact,
        totalFee: Number(studentTotalFee) || 60000,
        password: studentPassword || 'password123',
      });
      alert(`Student ${studentName} successfully admitted to hostel.`);
      setShowAddStudentModal(false);
      setStudentName('');
      setStudentEmail('');
      setStudentRollNumber('');
      setStudentContact('');
      setStudentRoomId('');
      fetchWardenData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to admit student');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Reallocate / Alter Room Handlers
  const handleOpenReallocateModal = (resident, room) => {
    setReallocatingResident(resident);
    setCurrentRoomObj(room);
    setTargetRoomId('');
    setShowReallocateModal(true);
  };

  const handleReallocateRoom = async (e) => {
    e.preventDefault();
    if (!reallocatingResident) return;
    setIsReallocating(true);
    try {
      await api.patch('/rooms/reassign', {
        studentId: reallocatingResident._id,
        newRoomId: targetRoomId || 'checkout',
      });
      alert(`Room assignment updated for ${reallocatingResident.name}.`);
      setShowReallocateModal(false);
      setReallocatingResident(null);
      setCurrentRoomObj(null);
      fetchWardenData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reallocate student');
    } finally {
      setIsReallocating(false);
    }
  };

  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupancy = rooms.reduce((acc, r) => acc + (r.currentOccupancy || 0), 0);
  const pendingComplaints = complaints.filter((c) => c.status === 'Pending' || c.status === 'In Progress');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Campus Warden Portal – {campusData?.name || 'Assigned Campus'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hostel Floor & Resident Operations
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Real-time oversight of hostel room bed occupancy, active staff shifts, and AI-triaged student maintenance requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Admit New Student</span>
            </button>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              + Add Staff Member
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
          <span className="text-sm font-medium">Loading assigned campus data & rosters...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Hostel Rooms</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{rooms.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Across {campusData?.blocks?.join(', ') || 'A & B Wings'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Bed Occupancy</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {totalOccupancy} / {totalCapacity}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}% Filled
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">On-Duty Staff</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                {campusData?.activeStaff?.length || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active on shifts today</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Open Grievances</span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">
                {pendingComplaints.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Pending maintenance tickets</div>
            </div>
          </div>

          {/* Active Staff Roster */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Assigned Campus Staff Roster</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Caretakers, electrical technicians, and security personnel on shift.
                </p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
              >
                + Add Staff
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {campusData?.activeStaff?.map((st) => (
                <div
                  key={st._id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{st.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-amber-300 border border-amber-500/20">
                        {st.designation}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{st.shift}</span>
                    </div>
                  </div>

                  {st.contact && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{st.contact}</span>
                      </span>
                      <a
                        href={`tel:${st.contact}`}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Call
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Room Allocation Grid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Room Bed Inventory & Resident Allotments</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Assign registered students directly to rooms.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {unassignedStudents.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{unassignedStudents.length} Students Awaiting Room</span>
                  </span>
                )}
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Admit Student</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.map((room) => {
                const isFull = room.currentOccupancy >= room.capacity;
                return (
                  <div
                    key={room._id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isFull
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-indigo-950/20 border-indigo-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-black text-white">{room.roomNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isFull
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {room.currentOccupancy} / {room.capacity} Beds
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mb-3">
                        {room.block} • Floor {room.floor}
                      </div>

                      {/* Residents List */}
                      <div className="space-y-1.5 mb-4">
                        {room.residents && room.residents.length > 0 ? (
                          room.residents.map((res) => (
                            <div
                              key={res._id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                            >
                              <div className="truncate pr-2">
                                <div className="font-semibold text-slate-200 truncate">{res.name}</div>
                                <div className="text-[10px] text-slate-500">{res.rollNumber}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleOpenReallocateModal(res, room)}
                                  title="Alter Room / Reallocate Student"
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline flex items-center gap-0.5"
                                >
                                  <ArrowLeftRight className="w-2.5 h-2.5" />
                                  <span>Alter</span>
                                </button>
                                <button
                                  onClick={() => handleUnassignStudent(room._id, res._id)}
                                  title="Unassign Resident"
                                  className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500 italic bg-slate-900/50 rounded-lg">
                            Room is empty
                          </div>
                        )}
                      </div>
                    </div>

                    {!isFull && (
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowAssignModal(true);
                        }}
                        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign Resident</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgent Grievances Triage Feed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Campus Grievance Triage Feed</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Complaints categorized with Gemini AI urgency analysis.
            </p>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No grievances filed for this campus.
                </div>
              ) : (
                complaints.map((comp) => {
                  const urgency = comp.aiAnalysis?.urgencyScore;
                  return (
                    <div
                      key={comp._id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-sm text-white">{comp.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-indigo-300 border border-indigo-500/20">
                            {comp.category}
                          </span>
                          {urgency && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                urgency >= 8
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              AI Urgency: {urgency}/10
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{comp.description}</p>
                        <div className="mt-2 text-[10px] text-slate-500">
                          Filed by: {comp.student?.name} ({comp.student?.rollNumber}) • Room{' '}
                          {comp.student?.room?.roomNumber || 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={comp.status}
                          onChange={(e) => handleUpdateComplaint(comp._id, e.target.value)}
                          className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Assign Student to Room {selectedRoom.roomNumber}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an unassigned student or enter their registered Roll Number.
            </p>

            <form onSubmit={handleAssignStudent} className="space-y-4">
              {unassignedStudents.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select from Unassigned Students
                  </label>
                  <select
                    onChange={(e) => setStudentRoll(e.target.value)}
                    value={studentRoll}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose a student --</option>
                    {unassignedStudents.map((st) => (
                      <option key={st._id} value={st.rollNumber}>
                        {st.name} ({st.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Or Enter Roll Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2401530100101"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  {isAssigning ? 'Assigning...' : 'Assign to Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && campusData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Add Staff Member to {campusData.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add active caretaker, electrician, or security staff on duty.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Staff Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Prakash"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrician / Plumber / Caretaker"
                  value={staffDesignation}
                  onChange={(e) => setStaffDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Shift</label>
                <select
                  value={staffShift}
                  onChange={(e) => setStaffShift(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                  <option value="Day (2 PM - 10 PM)">Day (2 PM - 10 PM)</option>
                  <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                  <option value="General (9 AM - 5 PM)">General (9 AM - 5 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={staffContact}
                  onChange={(e) => setStaffContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30"
                >
                  Save to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admit New Student Modal (Warden) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Direct Student Admission</h3>
                  <p className="text-xs text-slate-400">Admit a resident student directly to {campusData?.name || 'this campus'}.</p>
                </div>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Roll / Admission Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2401530100109"
                    value={studentRollNumber}
                    onChange={(e) => setStudentRollNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Campus Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room Bed Allotment</label>
                  <select
                    value={studentRoomId}
                    onChange={(e) => setStudentRoomId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Assign Room Later (Awaiting Allotment Pool)</option>
                    {rooms
                      .filter((r) => r.currentOccupancy < r.capacity && r.status !== 'maintenance')
                      .map((r) => (
                        <option key={r._id} value={r._id}>
                          Room {r.roomNumber} ({r.block}, Floor {r.floor}) — {r.capacity - r.currentOccupancy} bed(s) available
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Annual Fee (INR)</label>
                  <input
                    type="number"
                    placeholder="60000"
                    value={studentTotalFee}
                    onChange={(e) => setStudentTotalFee(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmittingStudent ? 'Admitting...' : 'Admit Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alter / Reallocate Room Modal */}
      {showReallocateModal && reallocatingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Alter Room Assignment</h3>
                  <p className="text-xs text-slate-400">Reallocate resident to another vacant room or check out.</p>
                </div>
              </div>
              <button onClick={() => setShowReallocateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 space-y-1">
              <div className="text-xs font-bold text-white">{reallocatingResident.name}</div>
              <div className="text-[11px] text-slate-400">Roll Number: {reallocatingResident.rollNumber}</div>
              <div className="text-[11px] text-indigo-400 font-semibold">
                Current Room: {currentRoomObj?.roomNumber || 'Unassigned'} ({currentRoomObj?.block || 'Main'})
              </div>
            </div>

            <form onSubmit={handleReallocateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Destination Room</label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select New Destination Room...</option>
                  {rooms
                    .filter(
                      (r) =>
                        r._id !== currentRoomObj?._id &&
                        r.currentOccupancy < r.capacity &&
                        r.status !== 'maintenance'
                    )
                    .map((r) => (
                      <option key={r._id} value={r._id}>
                        Room {r.roomNumber} ({r.block}, Floor {r.floor}) — {r.capacity - r.currentOccupancy} bed(s) available
                      </option>
                    ))}
                  <option value="checkout" className="text-rose-400 font-semibold">
                    Unassign & Check out to Awaiting Room Pool
                  </option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReallocateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReallocating}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isReallocating ? 'Reallocating...' : 'Confirm Reallocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenDashboard;

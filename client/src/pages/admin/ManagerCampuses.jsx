import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  Users,
  Coins,
  AlertCircle,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Phone,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Trash2,
  UserPlus,
  Mail,
  Key,
} from 'lucide-react';

export const ManagerCampuses = () => {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [campusDetail, setCampusDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create Campus Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampusName, setNewCampusName] = useState('');
  const [newCampusAddress, setNewCampusAddress] = useState('');
  const [newCampusBlocks, setNewCampusBlocks] = useState('A-Wing, B-Wing');
  const [newCampusRooms, setNewCampusRooms] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Campus Roster Staff Modal State (caretakers/security)
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('Hostel Caretaker');
  const [staffShift, setStaffShift] = useState('Morning (6 AM - 2 PM)');
  const [staffContact, setStaffContact] = useState('');

  // Manager Staff Roster (Wardens & Accountants)
  const [showManageStaffModal, setShowManageStaffModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [showAddStaffAccountForm, setShowAddStaffAccountForm] = useState(false);
  const [staffAccountName, setStaffAccountName] = useState('');
  const [staffAccountEmail, setStaffAccountEmail] = useState('');
  const [staffAccountRole, setStaffAccountRole] = useState('warden');
  const [staffAccountCampus, setStaffAccountCampus] = useState('');
  const [staffAccountContact, setStaffAccountContact] = useState('');
  const [staffAccountPassword, setStaffAccountPassword] = useState('password123');

  // Student Admission Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRollNumber, setStudentRollNumber] = useState('');
  const [studentCampus, setStudentCampus] = useState('');
  const [studentRoom, setStudentRoom] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentTotalFee, setStudentTotalFee] = useState('60000');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Fetch all campuses
  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campuses');
      setCampuses(res.data.campuses || []);
    } catch (err) {
      console.error('Failed to fetch campuses:', err);
      setError(err.response?.data?.message || 'Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  // Open Campus Detail View
  const handleOpenCampus = async (campus) => {
    setSelectedCampus(campus);
    setDetailLoading(true);
    try {
      const res = await api.get(`/campuses/${campus._id}`);
      setCampusDetail(res.data.campus);
    } catch (err) {
      console.error('Failed to load campus detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Create Campus Submit
  const handleCreateCampus = async (e) => {
    e.preventDefault();
    if (!newCampusName || !newCampusAddress) return;
    setIsSubmitting(true);
    try {
      await api.post('/campuses', {
        name: newCampusName,
        address: newCampusAddress,
        blocks: newCampusBlocks,
        totalRooms: Number(newCampusRooms) || 0,
      });
      setShowCreateModal(false);
      setNewCampusName('');
      setNewCampusAddress('');
      fetchCampuses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create campus');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Staff Submit
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !selectedCampus) return;
    try {
      await api.post(`/campuses/${selectedCampus._id}/staff`, {
        name: staffName,
        designation: staffDesignation,
        shift: staffShift,
        contact: staffContact,
      });
      setShowAddStaffModal(false);
      setStaffName('');
      setStaffContact('');
      // Refresh current campus detail
      handleOpenCampus(selectedCampus);
      fetchCampuses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add staff');
    }
  };

  // Staff Account Management Handlers (Wardens & Accountants)
  const fetchStaffList = async () => {
    setStaffLoading(true);
    try {
      const res = await api.get('/users/staff');
      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleCreateStaffAccount = async (e) => {
    e.preventDefault();
    if (!staffAccountName || !staffAccountEmail || !staffAccountPassword) return;
    try {
      await api.post('/users/staff', {
        name: staffAccountName.trim(),
        email: staffAccountEmail.trim(),
        password: staffAccountPassword.trim(),
        role: staffAccountRole,
        campus: staffAccountCampus || null,
        contactNumber: staffAccountContact,
      });
      alert(`${staffAccountRole.toUpperCase()} account created successfully!`);
      setShowAddStaffAccountForm(false);
      setStaffAccountName('');
      setStaffAccountEmail('');
      setStaffAccountPassword('password123');
      setStaffAccountContact('');
      fetchStaffList();
      fetchCampuses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff account');
    }
  };

  const handleRemoveStaffAccount = async (staffId, sName) => {
    if (!window.confirm(`Are you sure you want to remove staff account "${sName}"?`)) return;
    try {
      await api.delete(`/users/staff/${staffId}`);
      alert('Staff member removed successfully');
      fetchStaffList();
      fetchCampuses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove staff member');
    }
  };

  // Student Admission & Removal Handlers
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !studentRollNumber) return;
    setIsSubmittingStudent(true);
    try {
      await api.post('/users/student', {
        name: studentName.trim(),
        email: studentEmail.trim(),
        rollNumber: studentRollNumber.trim(),
        campus: studentCampus || selectedCampus?._id || null,
        room: studentRoom || null,
        contactNumber: studentContact,
        totalFee: Number(studentTotalFee) || 60000,
        password: studentPassword || 'password123',
      });
      alert(`Student ${studentName} admitted successfully!`);
      setShowAddStudentModal(false);
      setStudentName('');
      setStudentEmail('');
      setStudentRollNumber('');
      setStudentContact('');
      setStudentRoom('');
      fetchCampuses();
      if (selectedCampus) {
        handleOpenCampus(selectedCampus);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to admit student');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId, sName) => {
    if (!window.confirm(`Are you sure you want to permanently remove student "${sName}" from the database?`)) return;
    try {
      await api.delete(`/users/student/${studentId}`);
      alert(`Student "${sName}" was removed successfully.`);
      fetchCampuses();
      if (selectedCampus) {
        handleOpenCampus(selectedCampus);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central Management Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Multi-Campus Operations Grid
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time occupancy tracking, staff rosters, and financial collection across all campus branches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              fetchStaffList();
              setShowManageStaffModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition hover:scale-[1.02]"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Manage Staff & Wardens</span>
          </button>

          <button
            onClick={() => {
              setStudentCampus(campuses[0]?._id || '');
              setShowAddStudentModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>+ Admit Student</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campus</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading campus branches & real-time analytics...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Campuses Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campuses.map((campus) => {
            const stats = campus.stats || {};
            const occRate = stats.occupancyRate || 0;
            const collRate = stats.collectionRate || 0;

            return (
              <div
                key={campus._id}
                onClick={() => handleOpenCampus(campus)}
                className="group relative bg-slate-900/80 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Name & Address */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-gradient-to-tr from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-2xl group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {campus.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                          {campus.address}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {campus.blocks?.length || 2} Blocks
                    </span>
                  </div>

                  {/* Warden on Duty */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
                    <img
                      src={campus.warden?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={campus.warden?.name || 'Warden'}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {campus.warden?.name || 'Warden Not Assigned'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {campus.warden?.contactNumber || 'Contact not on file'}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400">
                      {campus.activeStaff?.length || 0} on-duty staff
                    </span>
                  </div>

                  {/* Metric Progress Bars */}
                  <div className="space-y-4 mb-5">
                    {/* Occupancy */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Room Occupancy</span>
                        </span>
                        <span className="font-semibold text-slate-200">
                          {stats.currentOccupancy || 0} / {stats.totalCapacity || 0} beds ({occRate}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, occRate)}%` }}
                        />
                      </div>
                    </div>

                    {/* Fee Collection */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Fee Collection</span>
                        </span>
                        <span className="font-semibold text-emerald-400">
                          ₹{(stats.collectedFees || 0).toLocaleString()} ({collRate}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, collRate)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Total: ₹{(stats.totalFees || 0).toLocaleString()}</span>
                        <span className="text-amber-400/90">Pending: ₹{(stats.pendingFees || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Open Campus Operations View</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Campus Details Drawer / Modal */}
      {selectedCampus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedCampus.name} – Operations Control
                  </h2>
                  <p className="text-xs text-slate-400">{selectedCampus.address}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCampus(null);
                  setCampusDetail(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading && (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
                  <span>Loading campus records...</span>
                </div>
              )}

              {!detailLoading && campusDetail && (
                <>
                  {/* Quick Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Rooms
                      </span>
                      <span className="text-xl font-black text-white">
                        {campusDetail.stats?.totalRooms || 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Occupancy
                      </span>
                      <span className="text-xl font-black text-indigo-400">
                        {campusDetail.stats?.currentOccupancy || 0} / {campusDetail.stats?.totalCapacity || 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Collected Fees
                      </span>
                      <span className="text-xl font-black text-emerald-400">
                        ₹{(campusDetail.stats?.collectedFees || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Pending Dues
                      </span>
                      <span className="text-xl font-black text-amber-400">
                        ₹{(campusDetail.stats?.pendingFees || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Active Staff Section */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>On-Duty Staff Roster ({campusDetail.activeStaff?.length || 0})</span>
                        </h4>
                        <p className="text-xs text-slate-400">Active caretaking and security personnel on shifts.</p>
                      </div>
                      <button
                        onClick={() => setShowAddStaffModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                      >
                        + Add Staff
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {campusDetail.activeStaff?.map((st) => (
                        <div key={st._id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <div className="font-semibold text-slate-200">{st.name}</div>
                          <div className="text-slate-400 text-[11px]">{st.designation}</div>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-indigo-400">
                            <Clock className="w-3 h-3" />
                            <span>{st.shift}</span>
                          </div>
                          {st.contact && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                              <Phone className="w-3 h-3" />
                              <span>{st.contact}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Allocation Table */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          <span>Room Allotment & Residents</span>
                        </h4>
                        <p className="text-xs text-slate-400">Current resident allocations and student records in this campus.</p>
                      </div>
                      <button
                        onClick={() => {
                          setStudentCampus(selectedCampus._id);
                          setShowAddStudentModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Admit Student to this Campus</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-500">
                          <tr>
                            <th className="py-2">Room</th>
                            <th className="py-2">Block</th>
                            <th className="py-2">Occupancy</th>
                            <th className="py-2">Residents (Active Students)</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {campusDetail.rooms?.map((rm) => (
                            <tr key={rm._id} className="hover:bg-slate-900/50">
                              <td className="py-2.5 font-bold text-white">{rm.roomNumber}</td>
                              <td className="py-2.5 text-slate-400">{rm.block}</td>
                              <td className="py-2.5">
                                {rm.currentOccupancy} / {rm.capacity}
                              </td>
                              <td className="py-2.5">
                                {rm.residents && rm.residents.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {rm.residents.map((res) => (
                                      <span
                                        key={res._id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                                      >
                                        <span className="font-medium">{res.name}</span>
                                        <span className="text-[10px] text-slate-400">({res.rollNumber})</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveStudent(res._id, res.name);
                                          }}
                                          title="Remove student from system"
                                          className="text-slate-500 hover:text-rose-400 transition ml-0.5"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic">No residents</span>
                                )}
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    rm.status === 'full'
                                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  }`}
                                >
                                  {rm.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Campus Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Create New Campus Branch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Campus Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LIET North Campus"
                  value={newCampusName}
                  onChange={(e) => setNewCampusName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Campus Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 62, Noida, UP"
                  value={newCampusAddress}
                  onChange={(e) => setNewCampusAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hostel Blocks</label>
                <input
                  type="text"
                  placeholder="e.g. A-Wing, B-Wing, C-Wing"
                  value={newCampusBlocks}
                  onChange={(e) => setNewCampusBlocks(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Rooms</label>
                <input
                  type="number"
                  placeholder="10"
                  value={newCampusRooms}
                  onChange={(e) => setNewCampusRooms(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Creating...' : 'Create Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal (Caretakers & On-duty staff) */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add Staff to {selectedCampus?.name}</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caretaker, Electrician, Security"
                  value={staffDesignation}
                  onChange={(e) => setStaffDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Shift</label>
                <select
                  value={staffShift}
                  onChange={(e) => setStaffShift(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  placeholder="+91 98765 00000"
                  value={staffContact}
                  onChange={(e) => setStaffContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HQ Manage Staff & Wardens Modal */}
      {showManageStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Staff & Wardens Administration</h3>
                  <p className="text-xs text-slate-400">Add, view, and remove Wardens and Accountants across campuses.</p>
                </div>
              </div>
              <button onClick={() => setShowManageStaffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registered Staff Accounts ({staffList.length})
                </h4>
                <button
                  onClick={() => setShowAddStaffAccountForm(!showAddStaffAccountForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddStaffAccountForm ? 'Close Form' : '+ Add Staff Account'}</span>
                </button>
              </div>

              {/* Add Staff Account Form */}
              {showAddStaffAccountForm && (
                <form
                  onSubmit={handleCreateStaffAccount}
                  className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-4"
                >
                  <div className="text-xs font-bold text-indigo-300">Create New Staff Member</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Kanchan Verma"
                        value={staffAccountName}
                        onChange={(e) => setStaffAccountName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="warden@hostel.in"
                        value={staffAccountEmail}
                        onChange={(e) => setStaffAccountEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Role Hierarchy</label>
                      <select
                        value={staffAccountRole}
                        onChange={(e) => setStaffAccountRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="warden">Hostel Warden (Campus Administrator)</option>
                        <option value="accountant">Campus Accountant (Financial Ledger)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Assigned Campus</label>
                      <select
                        value={staffAccountCampus}
                        onChange={(e) => setStaffAccountCampus(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Campus...</option>
                        {campuses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Contact Number</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={staffAccountContact}
                        onChange={(e) => setStaffAccountContact(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Initial Password</label>
                      <input
                        type="text"
                        required
                        placeholder="password123"
                        value={staffAccountPassword}
                        onChange={(e) => setStaffAccountPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStaffAccountForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              )}

              {/* Staff Table */}
              {staffLoading ? (
                <div className="py-12 flex justify-center items-center text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-xs">Loading staff records...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3">Staff Member</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Campus</th>
                        <th className="py-2.5 px-3">Contact</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                      {staffList.map((st) => (
                        <tr key={st._id} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{st.name}</div>
                            <div className="text-[10px] text-slate-400">{st.email}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                st.role === 'warden'
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                  : st.role === 'accountant'
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                              }`}
                            >
                              {st.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {st.campus?.name || <span className="text-slate-500 italic">Unassigned</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{st.contactNumber || '—'}</td>
                          <td className="py-2.5 px-3 text-right">
                            {st.role !== 'manager' ? (
                              <button
                                onClick={() => handleRemoveStaffAccount(st._id, st.name)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] font-semibold transition"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">Protected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admit Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Admit Resident Student</h3>
                  <p className="text-xs text-slate-400">Register and create credentials for a new hostel resident.</p>
                </div>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tejasvi Raghuvanshi"
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
                    placeholder="e.g. 2401530100155"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Campus</label>
                  <select
                    value={studentCampus}
                    onChange={(e) => setStudentCampus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select Campus...</option>
                    {campuses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
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
    </div>
  );
};

export default ManagerCampuses;

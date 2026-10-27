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

  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('Hostel Caretaker');
  const [staffShift, setStaffShift] = useState('Morning (6 AM - 2 PM)');
  const [staffContact, setStaffContact] = useState('');

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

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Campus</span>
        </button>
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
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>Room Allotment & Residents</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">Current resident allocations in this campus.</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-500">
                          <tr>
                            <th className="py-2">Room</th>
                            <th className="py-2">Block</th>
                            <th className="py-2">Occupancy</th>
                            <th className="py-2">Residents</th>
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
                                      <span key={res._id} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
                                        {res.name} ({res.rollNumber})
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

      {/* Add Staff Modal */}
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
    </div>
  );
};

export default ManagerCampuses;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  Plus,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Hash,
  Shield,
} from 'lucide-react';

export const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState(null);

  // Create Room Form
  const [createFormData, setCreateFormData] = useState({
    roomNumber: '',
    block: 'A-Wing',
    floor: 1,
    capacity: 2,
  });

  // Assign Student Form
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRoomsAndStudents = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes] = await Promise.allSettled([
        api.get('/rooms'),
        api.get('/auth/students'),
      ]);

      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value.data.rooms || []);
      if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndStudents();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/rooms', createFormData);
      setShowCreateModal(false);
      setCreateFormData({ roomNumber: '', block: 'A-Wing', floor: 1, capacity: 2 });
      await fetchRoomsAndStudents();
      setToastMessage('New hostel room created successfully!');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedRoomForAssign) return;

    setSubmitting(true);
    setError('');

    try {
      await api.put(`/rooms/${selectedRoomForAssign._id}/assign`, {
        studentId: selectedStudentId || undefined,
        rollNumber: rollNumberInput ? rollNumberInput.trim() : undefined,
      });

      setShowAssignModal(false);
      setSelectedStudentId('');
      setRollNumberInput('');
      setStudentSearch('');
      await fetchRoomsAndStudents();
      setToastMessage('Student allocated to room successfully!');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignStudent = async (roomId, studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unassign ${studentName} from this room?`)) {
      return;
    }

    try {
      await api.put(`/rooms/${roomId}/unassign`, { studentId });
      await fetchRoomsAndStudents();
      setToastMessage(`${studentName} unassigned successfully!`);
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unassign student.');
    }
  };

  // Filter students in dropdown
  const filteredStudents = students.filter((s) => {
    const text = `${s.name} ${s.rollNumber} ${s.email}`.toLowerCase();
    return text.includes(studentSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hostel Room Inventory & Allocation
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure rooms across blocks, assign students, and monitor capacities.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Add New Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Configure New Hostel Room</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  value={createFormData.roomNumber}
                  onChange={(e) => setCreateFormData({ ...createFormData, roomNumber: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm uppercase bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Block / Wing *</label>
                  <select
                    value={createFormData.block}
                    onChange={(e) => setCreateFormData({ ...createFormData, block: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="A-Wing">A-Wing</option>
                    <option value="B-Wing">B-Wing</option>
                    <option value="C-Wing">C-Wing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Floor Level *</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    required
                    value={createFormData.floor}
                    onChange={(e) => setCreateFormData({ ...createFormData, floor: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bed Capacity *</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  required
                  value={createFormData.capacity}
                  onChange={(e) => setCreateFormData({ ...createFormData, capacity: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition"
                >
                  {submitting ? 'Creating...' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && selectedRoomForAssign && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <span>Assign Student to Room {selectedRoomForAssign.roomNumber}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available Beds: {selectedRoomForAssign.capacity - selectedRoomForAssign.currentOccupancy} of {selectedRoomForAssign.capacity}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Registered Student
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    aria-label="Search registered students"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((stu) => (
                      <div
                        key={stu._id}
                        onClick={() => {
                          setSelectedStudentId(stu._id);
                          setRollNumberInput(stu.rollNumber || '');
                        }}
                        className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                          selectedStudentId === stu._id
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{stu.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {stu.rollNumber || 'No Roll No'} • {stu.room ? `Assigned (${stu.room.roomNumber})` : 'Unassigned'}
                          </div>
                        </div>
                        {selectedStudentId === stu._id && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">No matching students found.</div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block text-center my-1">— OR ENTER ROLL NUMBER DIRECTLY —</label>
                <input
                  type="text"
                  aria-label="Roll number"
                  value={rollNumberInput}
                  onChange={(e) => setRollNumberInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs uppercase bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!selectedStudentId && !rollNumberInput.trim())}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Inventory Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm">Loading hostel room inventory...</span>
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => {
            const isFull = room.currentOccupancy >= room.capacity;
            const hasAvailableBed = !isFull && room.status !== 'maintenance';

            return (
              <div
                key={room._id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-bold text-slate-400 font-mono">
                        {room.block} • Floor {room.floor}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-0.5">
                        Room {room.roomNumber}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        room.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : room.status === 'full'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Occupancy</span>
                      <span className="text-slate-200 font-bold font-mono">
                        {room.currentOccupancy} / {room.capacity} Beds
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 p-0.5 border border-slate-800">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          isFull ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (room.currentOccupancy / room.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Residents List / Avatars */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Allocated Students ({room.residents?.length || 0})
                    </span>
                    {room.residents && room.residents.length > 0 ? (
                      <div className="space-y-1.5">
                        {room.residents.map((res) => (
                          <div
                            key={res._id}
                            className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={
                                  res.avatar ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                                }
                                alt={res.name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                              <div className="truncate">
                                <span className="font-semibold text-white truncate block">{res.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{res.rollNumber || 'CS202501'}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnassignStudent(room._id, res._id, res.name)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                              title="Unassign student"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic py-1">No residents allocated yet.</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedRoomForAssign(room);
                      setError('');
                      setShowAssignModal(true);
                    }}
                    disabled={!hasAvailableBed}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 transition disabled:opacity-40 disabled:hover:bg-slate-800 disabled:hover:text-slate-200"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isFull ? 'Room Full' : 'Assign Student to Bed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm max-w-lg mx-auto space-y-3">
          <Building2 className="w-12 h-12 text-indigo-400 mx-auto" />
          <div className="font-bold text-white text-base">No Hostel Rooms Configured</div>
          <p className="text-xs text-slate-400">Click Add New Room above to set up hostel wings and bed counts.</p>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;

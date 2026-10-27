import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  X,
  Loader2,
  Building2,
  User,
  Wrench,
  Check,
  Flame,
} from 'lucide-react';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  // Resolution Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      await api.put(`/complaints/${selectedTicket._id}/status`, {
        status: newStatus,
        adminRemarks: remarks,
      });

      setSelectedTicket(null);
      await fetchComplaints();
      setToastMessage('Grievance ticket status and remarks updated successfully!');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    // Status filter
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;

    // Urgency filter
    const urgency = c.aiAnalysis?.urgencyScore || 5;
    if (urgencyFilter === 'Critical' && urgency < 8) return false;
    if (urgencyFilter === 'Moderate' && (urgency < 5 || urgency > 7)) return false;
    if (urgencyFilter === 'Standard' && urgency > 4) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentName = c.student?.name?.toLowerCase() || '';
      const roll = c.student?.rollNumber?.toLowerCase() || '';
      const title = c.title?.toLowerCase() || '';
      const desc = c.description?.toLowerCase() || '';
      const roomNum = c.student?.room?.roomNumber?.toLowerCase() || '';

      if (!studentName.includes(q) && !roll.includes(q) && !title.includes(q) && !desc.includes(q) && !roomNum.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const getUrgencyBadge = (score) => {
    const val = Number(score) || 5;
    if (val >= 8) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          Urgency: {val}/10 (Critical)
        </span>
      );
    } else if (val >= 6) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Urgency: {val}/10 (Moderate)
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Urgency: {val}/10 (Standard)
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Resolved</span>;
      case 'In Progress':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">In Progress</span>;
      case 'Rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Maintenance Triage & Grievances
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Review, triage, and resolve resident repair tickets prioritized by Gemini AI urgency scoring.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, room number, or issue keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
            >
              <option value="All">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Mess">Mess</option>
              <option value="Internet/WiFi">Internet/WiFi</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Urgency Level</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
            >
              <option value="All">All Urgency Scores</option>
              <option value="Critical">Critical (Score 8 - 10)</option>
              <option value="Moderate">Moderate (Score 5 - 7)</option>
              <option value="Standard">Standard (Score 1 - 4)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detail / Action Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-white">Grievance Ticket Resolution</h3>
                <span className="text-xs text-slate-400">ID: {selectedTicket._id}</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="text-white font-semibold">
                  {selectedTicket.student?.name} ({selectedTicket.student?.rollNumber || 'CS202501'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allocated Room:</span>
                <span className="text-white font-mono">
                  {selectedTicket.student?.room?.roomNumber || 'Not assigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="text-white font-bold">{selectedTicket.title}</span>
              </div>
              <div className="pt-1 text-slate-300 leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Gemini AI Triage Block */}
            {selectedTicket.aiAnalysis && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Gemini AI Triage Assessment</span>
                  </span>
                  {getUrgencyBadge(selectedTicket.aiAnalysis.urgencyScore)}
                </div>
                {selectedTicket.aiAnalysis.summary && (
                  <p className="text-slate-300 text-xs">
                    <strong>Summary:</strong> {selectedTicket.aiAnalysis.summary}
                  </p>
                )}
                {selectedTicket.aiAnalysis.actionRecommendation && (
                  <p className="text-indigo-200 text-xs">
                    <strong>Recommendation:</strong> {selectedTicket.aiAnalysis.actionRecommendation}
                  </p>
                )}
              </div>
            )}

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Set New Ticket Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Warden Remarks / Notes</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Electrician Sharma assigned; repaired MCB breaker on 2nd floor..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition disabled:opacity-50"
                >
                  {updating ? 'Saving Changes...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm">Fetching grievances for triage...</span>
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          {filteredComplaints.map((ticket) => (
            <div
              key={ticket._id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">{ticket.title}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {ticket.category}
                  </span>
                  {ticket.priority && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      Priority: {ticket.priority}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(ticket.status)}
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setNewStatus(ticket.status);
                      setRemarks(ticket.adminRemarks || '');
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                  >
                    Action Ticket
                  </button>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span>
                  Resident: <strong className="text-slate-200">{ticket.student?.name}</strong> ({ticket.student?.rollNumber || 'CS202501'})
                </span>
                <span>
                  Room: <strong className="text-slate-200 font-mono">{ticket.student?.room?.roomNumber || 'Not assigned'}</strong>
                </span>
                <span>Submitted: {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300">{ticket.description}</p>

              {/* AI Triage Snippet */}
              {ticket.aiAnalysis && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-300 font-medium truncate">
                      {ticket.aiAnalysis.actionRecommendation || ticket.aiAnalysis.summary}
                    </span>
                  </div>
                  {getUrgencyBadge(ticket.aiAnalysis.urgencyScore)}
                </div>
              )}

              {/* Existing Remarks */}
              {ticket.adminRemarks && (
                <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <strong className="text-amber-400">Warden Remarks:</strong> {ticket.adminRemarks}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm max-w-lg mx-auto space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div className="font-bold text-white text-base">No Matching Grievances</div>
          <p className="text-xs text-slate-400">No tickets match your active filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;

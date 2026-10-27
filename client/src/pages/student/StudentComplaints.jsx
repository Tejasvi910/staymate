import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  AlertCircle,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
  Wrench,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';

export const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Plumbing',
    priority: 'Medium',
    description: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/complaints', formData);
      setFormData({
        title: '',
        category: 'Plumbing',
        priority: 'Medium',
        description: '',
      });
      setShowModal(false);
      await fetchComplaints();

      setToastMessage('Complaint submitted and triaged by Gemini AI successfully!');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter complaints based on status
  const filteredComplaints = complaints.filter((item) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return item.status !== 'Resolved' && item.status !== 'Rejected';
    if (statusFilter === 'Resolved') return item.status === 'Resolved';
    return true;
  });

  // Color code urgency score from 1-10
  const getUrgencyBadge = (score) => {
    const val = Number(score) || 5;
    if (val >= 8) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Urgency: {val}/10 (Critical)
        </span>
      );
    } else if (val >= 6) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Urgency: {val}/10 (Moderate)
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Urgency: {val}/10 (Standard)
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            In Progress
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Pending Triage
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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
            Hostel Maintenance & Grievances
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Submit repair requests; Gemini AI calculates real-time urgency and recommends staff dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>File New Grievance</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Filter className="w-4 h-4 text-slate-500 mr-1" />
        {['All', 'Active', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">File Maintenance Grievance</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Plumbing', 'Electrical', 'Carpentry', 'Cleanliness', 'Mess', 'Internet/WiFi', 'Other'].map(
                      (cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Low', 'Medium', 'High', 'Urgent'].map((pri) => (
                      <option key={pri} value={pri}>{pri}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* AI Badge Note */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Gemini AI will score the urgency and recommend maintenance actions upon submission.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <span>Submit Grievance</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaints List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm">Loading your grievance tickets...</span>
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          {filteredComplaints.map((item) => (
            <div
              key={item._id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>

              {/* AI Triage Card Preview */}
              {item.aiAnalysis && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini AI Triage Assessment</span>
                    </span>
                    {getUrgencyBadge(item.aiAnalysis.urgencyScore)}
                  </div>

                  {item.aiAnalysis.summary && (
                    <p className="text-slate-300 text-xs">
                      <strong className="text-slate-400">Executive Summary:</strong> {item.aiAnalysis.summary}
                    </p>
                  )}

                  {item.aiAnalysis.actionRecommendation && (
                    <p className="text-slate-400 text-xs italic">
                      <strong className="text-slate-300">Staff Recommendation:</strong>{' '}
                      {item.aiAnalysis.actionRecommendation}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Remarks if provided */}
              {item.adminRemarks && (
                <div className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Warden Maintenance Remark:</span>
                  </div>
                  <p className="text-slate-300 pl-5">{item.adminRemarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div className="font-bold text-white text-base">No Grievances Found</div>
          <p className="text-xs text-slate-400">
            {statusFilter === 'All'
              ? 'You have not submitted any maintenance tickets yet.'
              : `No tickets match the '${statusFilter}' filter.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentComplaints;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Bell,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  X,
  Megaphone,
} from 'lucide-react';

export const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All',
    isPinned: false,
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notices');
      setNotices(response.data.notices || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/notices', formData);
      setFormData({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'All',
        isPinned: false,
      });
      await fetchNotices();
      setToastMessage('Campus bulletin broadcasted successfully!');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the notice: "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/notices/${id}`);
      await fetchNotices();
      setToastMessage('Bulletin deleted successfully.');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hostel Notices & Campus Broadcasts
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Publish official alerts, curfew notices, maintenance warnings, and dining announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Publish Notice Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Broadcast New Notice</h2>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mandatory Hostel Fire Drill on Friday"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
                >
                  <option value="General">General</option>
                  <option value="Mess">Mess</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white"
                >
                  <option value="All">All Residents</option>
                  <option value="Students">Students Only</option>
                  <option value="Hostel Block A">Hostel Block A</option>
                  <option value="Hostel Block B">Hostel Block B</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Body *</label>
              <textarea
                required
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full announcement text, timings, or emergency instructions..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPinnedCheck"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <label htmlFor="isPinnedCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                Pin to top of student dashboards
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? 'Broadcasting...' : 'Publish Notice'}</span>
            </button>
          </form>
        </div>

        {/* Right Column (2 Cols): Published Notices Feed */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Live Campus Announcements ({notices.length})</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">Sorted by Pinned & Newest</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="text-sm">Loading announcements...</span>
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map((n) => (
                <div
                  key={n._id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                      <h3 className="text-base font-bold text-white">{n.title}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          n.category === 'Urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : n.category === 'Mess'
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {n.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(n._id, n.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {n.content}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                    <span>Target: <strong className="text-slate-400">{n.targetAudience}</strong></span>
                    <span>Posted {new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-sm">
              No bulletins published yet. Fill in the form on the left to broadcast to students.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;

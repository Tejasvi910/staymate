import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Coins,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Send,
  Loader2,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  X,
  CreditCard,
} from 'lucide-react';

export const AccountantDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Payment Recording Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal
  const [receiptStudent, setReceiptStudent] = useState(null);

  // Success Notification
  const [toastMessage, setToastMessage] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/students');
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to load students for accounting:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !paymentAmount) return;

    setIsSubmitting(true);
    try {
      const res = await api.put(`/auth/students/${selectedStudent._id}/fee`, {
        paidAmount: Number(paymentAmount),
      });

      // Update in local state
      setStudents((prev) =>
        prev.map((s) => (s._id === selectedStudent._id ? res.data.student : s))
      );

      setToastMessage(
        `Successfully recorded payment of ₹${Number(paymentAmount).toLocaleString()} for ${selectedStudent.name}.`
      );
      setSelectedStudent(null);
      setPaymentAmount('');
      setPaymentNotes('');
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminder = (student) => {
    setToastMessage(`Payment reminder sent to ${student.name} (${student.email}).`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && s.feeStatus === filterStatus;
  });

  // Calculate Metrics
  const totalInvoiced = students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
  const totalCollected = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
  const totalPending = Math.max(0, totalInvoiced - totalCollected);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 shadow-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-3">
          <Coins className="w-3.5 h-3.5" />
          <span>Finance & Hostel Fee Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Campus Fee Ledger & Payment Receipts
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-xl">
          Track semester hostel dues, issue official payment receipts, and record cash/online fee installments.
        </p>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Invoiced</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalInvoiced.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total hostel fees assessed</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fees Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₹{totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">{collectionRate}% collection rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Dues</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">₹{totalPending.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Outstanding semester balance</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <Coins className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{students.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active ledger accounts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Partial', 'Paid'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st} {st !== 'All' ? `(${students.filter((s) => s.feeStatus === st).length})` : ''}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search students by name or roll number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Students Fee Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Loading financial ledger...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3">Campus / Room</th>
                  <th className="py-3 px-3 text-right">Total Fee</th>
                  <th className="py-3 px-3 text-right">Paid Amount</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                      No student records match current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const balance = Math.max(0, (s.totalFee || 0) - (s.paidFee || 0));
                    return (
                      <tr key={s._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-semibold text-white">
                          <div>{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.email}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{s.rollNumber}</td>
                        <td className="py-3 px-3 text-slate-400">
                          <div>{s.campus?.name || 'LIET Main Campus'}</div>
                          <div className="text-[10px] text-indigo-400 font-semibold">
                            {s.room ? `Room ${s.room.roomNumber} (${s.room.block})` : 'Unassigned'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium">
                          ₹{(s.totalFee || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          ₹{(s.paidFee || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-amber-400">
                          ₹{balance.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              s.feeStatus === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : s.feeStatus === 'Partial'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {s.feeStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {balance > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(s);
                                  setPaymentAmount(balance.toString());
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition flex items-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay</span>
                              </button>
                            )}

                            {balance > 0 && (
                              <button
                                onClick={() => handleSendReminder(s)}
                                title="Send Due Reminder"
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {s.paidFee > 0 && (
                              <button
                                onClick={() => setReceiptStudent(s)}
                                title="View / Print Receipt"
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Record Fee Payment</span>
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200">{selectedStudent.name}</div>
              <div className="text-slate-400">Roll: {selectedStudent.rollNumber}</div>
              <div className="mt-1 flex justify-between text-[11px] pt-1 border-t border-slate-800">
                <span className="text-slate-500">Current Paid: ₹{selectedStudent.paidFee?.toLocaleString()}</span>
                <span className="text-amber-400 font-semibold">
                  Due: ₹{(selectedStudent.totalFee - selectedStudent.paidFee).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedStudent.totalFee - selectedStudent.paidFee}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Mode & Reference
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Voucher Modal */}
      {receiptStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Official Hostel Fee Receipt</h3>
                <span className="text-[10px] text-slate-400">
                  StayMate AI • Accounts Management Division
                </span>
              </div>
              <button
                onClick={() => setReceiptStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Name</span>
                  <span className="font-bold text-white">{receiptStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Roll Number</span>
                  <span className="font-mono text-white">{receiptStudent.rollNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Campus Branch</span>
                  <span>{receiptStudent.campus?.name || 'LIET Main Campus'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Room</span>
                  <span>Room {receiptStudent.room?.roomNumber || 'A-101'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Semester Hostel Fee Total</span>
                  <span className="font-semibold text-white">
                    ₹{receiptStudent.totalFee?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Amount Paid</span>
                  <span className="font-bold text-emerald-400">
                    ₹{receiptStudent.paidFee?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm pt-1">
                  <span className="font-bold text-slate-200">Balance Pending</span>
                  <span className="font-bold text-amber-400">
                    ₹{Math.max(0, receiptStudent.totalFee - receiptStudent.paidFee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2.5">
              <button
                onClick={() => setReceiptStudent(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;

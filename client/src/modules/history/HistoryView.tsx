import React, { useState, useEffect } from 'react';
import { History, Lock, FileText, CheckCircle2, Calendar, X, Utensils, Receipt, CreditCard, Image, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api, ApiError } from '../../lib/api';
import { useAutoDate } from '../../lib/dateUtils';

interface HistorySnapshot {
  id: string;
  month: string;
  mealTotal: number;
  expenseTotal: number;
  paymentTotal: number;
  balanceDue: number;
  status: string;
  isLocked: boolean;
}

interface SnapshotDetail {
  month: string;
  snapshot: HistorySnapshot | null;
  meals: any[];
  expenses: any[];
  payments: any[];
  totals: {
    mealTotal: number;
    expenseTotal: number;
    paymentTotal: number;
    totalSpent: number;
    balanceDue: number;
  };
}

export const HistoryView: React.FC = () => {
  const { user } = useAuthStore();
  const { currentMonth } = useAutoDate();
  const [historyList, setHistoryList] = useState<HistorySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Snapshot modal states
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [snapshotData, setSnapshotData] = useState<SnapshotDetail | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await api.get('/history');
        setHistoryList(data.history || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [user?.id]);

  const handleOpenSnapshot = async (month: string) => {
    setSelectedMonth(month);
    setIsModalLoading(true);
    setModalError(null);
    try {
      const data = await api.get<SnapshotDetail>(`/history/snapshot-details?month=${month}`);
      setSnapshotData(data);
    } catch (err: any) {
      setModalError(err instanceof ApiError ? err.message : 'Failed to load snapshot details.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedMonth(null);
    setSnapshotData(null);
    setViewingProofUrl(null);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <History className="w-8 h-8 text-[#4648d4]" />
            Monthly History &amp; Immutable Snapshots
          </h1>
          <p className="text-[#464554] text-xs mt-1">
            Review locked monthly cycles, historical meal dues, and financial archives.
          </p>
        </div>

        <button
          onClick={() => handleOpenSnapshot(currentMonth)}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" /> View Current Month Snapshot
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-[#767586] text-center py-8">Loading history snapshots...</p>
      ) : historyList.length === 0 ? (
        /* Professional Empty State */
        <div className="stitch-card p-12 text-center space-y-4 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#0b1c30]">No Closed Months Found</h3>
            <p className="text-xs text-[#767586] max-w-sm mx-auto mt-1">
              Once a monthly billing cycle is closed and locked by the warden, immutable snapshots will be archived here.
            </p>
          </div>
          <button
            onClick={() => handleOpenSnapshot(currentMonth)}
            className="btn-secondary text-xs py-2 px-4 mx-auto inline-flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-[#4648d4]" /> Inspect Active ({currentMonth}) Snapshot
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => (
            <div
              key={item.id}
              className="stitch-card stitch-card-hover p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-[#0b1c30]">{item.month}</h3>
                  <span className="text-xs bg-emerald-50 text-[#006c49] border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {item.status}
                  </span>
                  <span className="text-xs bg-slate-100 text-[#767586] px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
                <p className="text-xs text-[#767586]">Snapshot created at month closure • Immutable record</p>
              </div>

              <div className="flex flex-wrap items-center gap-8 text-xs">
                <div>
                  <span className="text-[#767586] block">Meals</span>
                  <span className="font-bold text-[#0b1c30] text-sm">₹{item.mealTotal}</span>
                </div>
                <div>
                  <span className="text-[#767586] block">Expenses</span>
                  <span className="font-bold text-[#0b1c30] text-sm">₹{item.expenseTotal}</span>
                </div>
                <div>
                  <span className="text-[#767586] block">Payments</span>
                  <span className="font-bold text-[#006c49] text-sm">₹{item.paymentTotal}</span>
                </div>
                <button
                  onClick={() => handleOpenSnapshot(item.month)}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#4648d4]" /> View Full Snapshot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Detail Modal */}
      {selectedMonth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-[#0b1c30]">
                    Monthly Snapshot Breakdown ({selectedMonth})
                  </h2>
                  {snapshotData?.snapshot?.isLocked ? (
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-slate-200">
                      <Lock className="w-3 h-3" /> Locked Archive
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Active Period
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#767586] mt-0.5">Detailed breakdown of meals, daily expenses, and payments.</p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isModalLoading ? (
              <p className="text-xs text-[#767586] text-center py-12">Loading full snapshot details...</p>
            ) : modalError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            ) : snapshotData ? (
              <div className="space-y-6">
                {/* Summary Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-[11px] text-[#767586] font-semibold block">Meal Charges</span>
                    <span className="text-lg font-bold text-[#0b1c30]">₹{snapshotData.totals.mealTotal}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-[11px] text-[#767586] font-semibold block">Daily Expenses</span>
                    <span className="text-lg font-bold text-[#0b1c30]">₹{snapshotData.totals.expenseTotal}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
                    <span className="text-[11px] text-emerald-800 font-semibold block">Approved Payments</span>
                    <span className="text-lg font-bold text-emerald-700">₹{snapshotData.totals.paymentTotal}</span>
                  </div>
                  <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80">
                    <span className="text-[11px] text-indigo-800 font-semibold block">Balance Due</span>
                    <span className="text-lg font-bold text-[#4648d4]">₹{snapshotData.totals.balanceDue}</span>
                  </div>
                </div>

                {/* Section 1: Meals */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#4648d4]" /> Tiffin &amp; Mess Meals ({snapshotData.meals.length})
                  </h3>
                  {snapshotData.meals.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No meals recorded for this month.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                      {snapshotData.meals.map((m) => (
                        <div key={m.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50/50">
                          <div>
                            <span className="font-semibold text-slate-900">{m.date}</span>
                            <span className="text-slate-500 ml-3">Lunch: {m.lunch} • Dinner: {m.dinner}</span>
                          </div>
                          <span className="font-bold text-slate-900">₹{m.totalCost}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Daily Expenses */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#4648d4]" /> Shared Daily Expenses ({snapshotData.expenses.length})
                  </h3>
                  {snapshotData.expenses.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No personal/shared expenses logged for this month.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                      {snapshotData.expenses.map((e) => (
                        <div key={e.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50/50">
                          <div>
                            <span className="font-semibold text-slate-900">{e.date}</span>
                            <span className="text-slate-500 ml-2 font-medium bg-slate-100 px-2 py-0.5 rounded-md">{e.category}</span>
                            {e.note && <span className="text-slate-400 ml-2">• {e.note}</span>}
                          </div>
                          <span className="font-bold text-slate-900">₹{e.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 3: Payments & Proofs */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#4648d4]" /> Payments &amp; Proofs ({snapshotData.payments.length})
                  </h3>
                  {snapshotData.payments.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No payment submissions for this month.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                      {snapshotData.payments.map((p) => (
                        <div key={p.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="font-semibold text-slate-900">{p.date}</span>
                              <span className="text-slate-500 ml-2">[{p.type}]</span>
                              {p.note && <span className="text-slate-400 ml-2">• {p.note}</span>}
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                p.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : p.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">₹{p.amount}</span>
                            {p.proofUrl && (
                              <button
                                onClick={() => setViewingProofUrl(p.proofUrl)}
                                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                              >
                                <Image className="w-3.5 h-3.5 text-indigo-600" /> Proof
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Proof Image Viewer Sub-Modal */}
      {viewingProofUrl && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#0b1c30]">Payment Proof Screenshot</h3>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2.5 py-1 border border-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
            <img
              src={viewingProofUrl}
              alt="Payment Screenshot Proof"
              className="w-full max-h-96 object-contain rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

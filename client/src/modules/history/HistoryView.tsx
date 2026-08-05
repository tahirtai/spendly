import React, { useState, useEffect } from 'react';
import { History, Lock, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

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

export const HistoryView: React.FC = () => {
  const { user } = useAuthStore();
  const [historyList, setHistoryList] = useState<HistorySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/history?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setHistoryList(data.history || []);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [user?.id]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
          <History className="w-8 h-8 text-[#4648d4]" />
          Monthly History & Immutable Snapshots
        </h1>
        <p className="text-[#464554] text-xs mt-1">
          Review locked monthly cycles, historical meal dues, and financial archives.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-[#767586] text-center py-8">Loading history snapshots...</p>
      ) : historyList.length === 0 ? (
        /* Professional Empty State */
        <div className="stitch-card p-12 text-center space-y-3 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-[#0b1c30]">No Closed Months Found</h3>
          <p className="text-xs text-[#767586] max-w-sm mx-auto">
            Once a monthly billing cycle is closed and locked by the warden, immutable snapshots will be archived here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => (
            <div key={item.id} className="stitch-card stitch-card-hover p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                <button className="btn-secondary text-xs py-2">
                  <FileText className="w-3.5 h-3.5" /> View Full Snapshot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

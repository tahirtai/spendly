import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, PieChart } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/api';

export const ReportsView: React.FC = () => {
  const { user } = useAuthStore();
  const [report, setReport] = useState<{
    month: string;
    mealTotal: number;
    expenseTotal: number;
    paymentTotal: number;
    remainingBalance: number;
    categories: Array<{ name: string; amount: number; pct: string }>;
  }>({
    month: new Date().toISOString().slice(0, 7),
    mealTotal: 0,
    expenseTotal: 0,
    paymentTotal: 0,
    remainingBalance: 0,
    categories: [],
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await api.get(`/reports/monthly?month=${selectedMonth}`);
        setReport(data);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [user?.id, selectedMonth]);

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Category,Amount", ...report.categories.map(c => `"${c.name}",${c.amount}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Spendly_Report_${report.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSpent = report.mealTotal + report.expenseTotal;

  return (
    <div className="mobile-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#006c49]" />
            Reports & Financial Analytics
          </h1>
          <p className="text-[#464554] text-xs mt-1">
            Export monthly expense statements, category breakdowns, and payment receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field cursor-pointer text-xs py-2 px-3 w-full sm:w-36 flex-shrink-0"
          />
          <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-3 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 whitespace-nowrap">
            <FileText className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={handleDownloadCSV} className="btn-secondary text-xs py-2 px-3 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 whitespace-nowrap">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Card */}
        <div className="stitch-card p-6 bg-white space-y-4">
          <h3 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#4648d4]" /> Expense Category Distribution
          </h3>

          {isLoading ? (
            <p className="text-xs text-[#767586] text-center py-8">Loading analytics breakdown...</p>
          ) : report.categories.length === 0 ? (
            <p className="text-xs text-[#767586] text-center py-8">No expense data recorded for this month.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {report.categories.map((item, idx) => {
                const colors = ['bg-[#4648d4]', 'bg-[#006c49]', 'bg-[#c05400]', 'bg-rose-500', 'bg-slate-600'];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#464554]">{item.name}</span>
                      <span className="text-[#0b1c30] font-bold">₹{item.amount} ({item.pct})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass}`} style={{ width: item.pct }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Summary Box */}
        <div className="stitch-card p-6 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-[#0b1c30]">{new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Audit Summary</h3>
            <p className="text-xs text-[#767586] mt-0.5">Generated snapshot statement for Hostel Warden submission.</p>

            <div className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#464554]">Total Meal Charges</span>
                <span className="font-bold text-[#0b1c30]">₹{report.mealTotal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#464554]">Total Daily Expenses</span>
                <span className="font-bold text-[#0b1c30]">₹{report.expenseTotal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[#464554]">Total Approved Payments</span>
                <span className="font-bold text-[#006c49]">-₹{report.paymentTotal}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm pt-2">
                <span className="text-[#0b1c30]">Net Remaining Dues</span>
                <span className="text-[#4648d4]">₹{report.remainingBalance}</span>
              </div>
            </div>
          </div>

          <button onClick={() => window.print()} className="btn-primary w-full text-xs mt-4">
            <Download className="w-4 h-4" /> Download PDF Statement
          </button>
        </div>
      </div>
    </div>
  );
};

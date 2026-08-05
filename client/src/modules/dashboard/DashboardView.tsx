import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Utensils, 
  Receipt, 
  CreditCard, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp,
  Sun,
  Moon,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState({
    currentMonthTotal: 0,
    remainingBalance: 0,
    mealsThisMonth: 0,
    dailyExpenses: 0,
    totalPayments: 0,
    missingEntries: 0,
  });

  const [todayMeal, setTodayMeal] = useState({
    date: new Date().toISOString().split('T')[0],
    lunch: 'SKIP',
    dinner: 'SKIP',
    lunchCost: 0,
    dinnerCost: 0,
    totalCost: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data on mount
  useEffect(() => {
    if (!user?.id) return;
    
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [sumRes, mealRes] = await Promise.all([
          fetch(`/api/dashboard/summary?userId=${user?.id}`),
          fetch(`/api/meals/today?userId=${user?.id}`)
        ]);

        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setMetrics(sumData);
        }

        if (mealRes.ok) {
          const mealData = await mealRes.json();
          setTodayMeal(mealData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user?.id]);

  const handleMealChange = async (type: 'lunch' | 'dinner', option: string) => {
    const updated = { ...todayMeal, [type]: option };
    setTodayMeal(updated);

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          date: updated.date,
          lunch: updated.lunch,
          dinner: updated.dinner,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.meal) setTodayMeal(data.meal);
        
        // Refresh metrics
        const sumRes = await fetch(`/api/dashboard/summary?userId=${user?.id}`);
        if (sumRes.ok) setMetrics(await sumRes.json());
      }
    } catch (err) {
      console.error('Failed to save meal selection:', err);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 stitch-card p-6 rounded-2xl bg-white border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight">
              Welcome back, {user?.fullName || 'Resident'}
            </h1>
          </div>
          <p className="text-[#464554] text-xs mt-1">
            Hostel Expense Overview • August 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/tiffin" className="btn-primary">
            <Plus className="w-4 h-4" /> Record Today's Meal
          </Link>
          <Link to="/payments" className="btn-secondary">
            <CreditCard className="w-4 h-4" /> Add Payment
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stitch-card stitch-card-hover p-5 bg-white">
          <div className="flex justify-between items-start">
            <span className="text-[#767586] text-xs font-semibold uppercase tracking-wider">Month Total</span>
            <div className="p-2 bg-[#eff4ff] text-[#4648d4] rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-[#0b1c30] mt-3">₹{metrics.currentMonthTotal}</p>
          <span className="text-[#767586] text-xs mt-2 block">Meals & Daily Expenses</span>
        </div>

        <div className="stitch-card stitch-card-hover p-5 bg-white">
          <div className="flex justify-between items-start">
            <span className="text-[#767586] text-xs font-semibold uppercase tracking-wider">Remaining Balance</span>
            <div className="p-2 bg-[#e6f9f1] text-[#006c49] rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-[#006c49] mt-3">₹{metrics.remainingBalance}</p>
          <span className="text-[#767586] text-xs mt-2 block">Outstanding Dues</span>
        </div>

        <div className="stitch-card stitch-card-hover p-5 bg-white">
          <div className="flex justify-between items-start">
            <span className="text-[#767586] text-xs font-semibold uppercase tracking-wider">Meals This Month</span>
            <div className="p-2 bg-[#fff2e6] text-[#c05400] rounded-xl">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-[#0b1c30] mt-3">{metrics.mealsThisMonth}</p>
          <span className="text-[#767586] text-xs mt-2 block">Recorded Entries</span>
        </div>

        <div className="stitch-card stitch-card-hover p-5 bg-amber-50/50 border-amber-200">
          <div className="flex justify-between items-start">
            <span className="text-amber-700 text-xs font-semibold uppercase tracking-wider">Missing Entries</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-amber-800 mt-3">{metrics.missingEntries} Days</p>
          <Link to="/tiffin" className="text-amber-700 text-xs font-semibold hover:underline mt-2 flex items-center gap-1">
            <span>Fill missing days</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Tiffin Meal Logger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="stitch-card p-6 bg-white space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0b1c30] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#4648d4]" />
                  Today's Tiffin Meal
                </h2>
                <p className="text-xs text-[#767586] mt-0.5">{todayMeal.date}</p>
              </div>
              <span className="text-xs bg-emerald-50 text-[#006c49] border border-emerald-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Month Unlocked
              </span>
            </div>

            {/* Meal Selector Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lunch Card */}
              <div className="bg-[#f8f9ff] border border-[#d3e4fe] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#0b1c30] flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" /> Lunch Meal
                  </span>
                  <span className="text-xs text-[#4648d4] font-bold">₹60 / ₹40</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['FULL', 'HALF', 'SKIP'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleMealChange('lunch', opt)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        todayMeal.lunch === opt
                          ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20'
                          : 'bg-white text-[#464554] hover:text-[#0b1c30] border border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dinner Card */}
              <div className="bg-[#f8f9ff] border border-[#d3e4fe] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#0b1c30] flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500" /> Dinner Meal
                  </span>
                  <span className="text-xs text-[#4648d4] font-bold">₹60 / ₹40</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['FULL', 'HALF', 'SKIP'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleMealChange('dinner', opt)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        todayMeal.dinner === opt
                          ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20'
                          : 'bg-white text-[#464554] hover:text-[#0b1c30] border border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-[#767586]">Today's Total: <span className="text-[#0b1c30] font-bold text-sm">₹{todayMeal.totalCost}</span></span>
              <span className="text-xs text-[#006c49] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hostel Info & Shortcuts */}
        <div className="space-y-6">
          <div className="stitch-card p-5 bg-white space-y-4">
            <h3 className="font-display text-xs font-bold text-[#767586] uppercase tracking-wider">
              Hostel Workspace
            </h3>
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#e2e8f0]">
              <p className="font-bold text-[#0b1c30]">Spendly Demo Hostel</p>
              <p className="text-xs text-[#464554] mt-1">Code: <span className="text-[#4648d4] font-mono font-semibold">SPENDLY_HOSTEL</span></p>
              <p className="text-xs text-[#464554] mt-1">Role: <span className="font-semibold capitalize">{user?.role?.toLowerCase() || 'student'}</span></p>
            </div>
          </div>

          <div className="stitch-card p-5 bg-white space-y-3">
            <h3 className="font-display text-xs font-bold text-[#767586] uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <Link to="/expenses" className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors border border-[#e2e8f0] text-sm font-medium text-[#0b1c30]">
              <span>Log Daily Expense</span>
              <ArrowUpRight className="w-4 h-4 text-[#767586]" />
            </Link>
            <Link to="/payments" className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors border border-[#e2e8f0] text-sm font-medium text-[#0b1c30]">
              <span>Upload UPI Receipt</span>
              <ArrowUpRight className="w-4 h-4 text-[#767586]" />
            </Link>
            <Link to="/reports" className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors border border-[#e2e8f0] text-sm font-medium text-[#0b1c30]">
              <span>Download Statement</span>
              <ArrowUpRight className="w-4 h-4 text-[#767586]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

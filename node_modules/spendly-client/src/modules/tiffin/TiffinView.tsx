import React, { useState, useEffect } from 'react';
import { Utensils, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Sun, Moon, Save } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const TiffinView: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lunch, setLunch] = useState('SKIP');
  const [dinner, setDinner] = useState('SKIP');
  const [lunchCost, setLunchCost] = useState(0);
  const [dinnerCost, setDinnerCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [halfPrice, setHalfPrice] = useState(40);
  const [fullPrice, setFullPrice] = useState(60);
  const [monthMeals, setMonthMeals] = useState<any[]>([]);

  // Load prices and meal for date
  useEffect(() => {
    async function loadData() {
      try {
        const priceRes = await fetch('/api/admin/prices');
        if (priceRes.ok) {
          const prices = await priceRes.json();
          setHalfPrice(prices.halfPrice || 40);
          setFullPrice(prices.fullPrice || 60);
        }

        if (user?.id) {
          const mealRes = await fetch(`/api/meals/today?userId=${user.id}`);
          if (mealRes.ok) {
            const data = await mealRes.json();
            if (data) {
              setLunch(data.lunch || 'SKIP');
              setDinner(data.dinner || 'SKIP');
              setLunchCost(data.lunchCost || 0);
              setDinnerCost(data.dinnerCost || 0);
              setTotalCost(data.totalCost || 0);
            }
          }

          const mListRes = await fetch(`/api/meals/month?userId=${user.id}`);
          if (mListRes.ok) {
            const mData = await mListRes.json();
            setMonthMeals(mData.meals || []);
          }
        }
      } catch (err) {
        console.error('Failed to load tiffin data:', err);
      }
    }
    loadData();
  }, [user?.id, selectedDate]);

  const handleSaveMeal = async (newLunch: string, newDinner: string) => {
    setLunch(newLunch);
    setDinner(newDinner);

    const lCost = newLunch === 'FULL' ? fullPrice : newLunch === 'HALF' ? halfPrice : 0;
    const dCost = newDinner === 'FULL' ? fullPrice : newDinner === 'HALF' ? halfPrice : 0;
    const tCost = lCost + dCost;

    setLunchCost(lCost);
    setDinnerCost(dCost);
    setTotalCost(tCost);

    if (!user?.id) return;

    try {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: selectedDate,
          lunch: newLunch,
          dinner: newDinner,
        }),
      });

      const mListRes = await fetch(`/api/meals/month?userId=${user.id}`);
      if (mListRes.ok) {
        const mData = await mListRes.json();
        setMonthMeals(mData.meals || []);
      }
    } catch (err) {
      console.error('Failed to save meal:', err);
    }
  };

  const recordedDayMap = new Set(monthMeals.map((m) => new Date(m.date).getDate()));
  const todayDay = new Date().getDate();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <Utensils className="w-8 h-8 text-[#4648d4]" />
            Tiffin & Mess Tracker
          </h1>
          <p className="text-[#464554] text-xs mt-1">
            Log daily meals, track missing entries, and calculate monthly mess dues.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] p-2.5 rounded-xl shadow-soft">
          <CalendarIcon className="w-4 h-4 text-[#4648d4]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-[#0b1c30] text-sm outline-none cursor-pointer font-medium"
          />
        </div>
      </div>

      {/* Pricing Rate Banner */}
      <div className="stitch-card p-4 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#006c49] animate-pulse" />
          <span className="text-xs font-semibold text-[#0b1c30]">Active Workspace Price Rates:</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-[#767586]">Half Meal:</span> <span className="font-bold text-[#006c49]">₹{halfPrice}</span>
          </div>
          <div>
            <span className="text-[#767586]">Full Meal:</span> <span className="font-bold text-[#4648d4]">₹{fullPrice}</span>
          </div>
        </div>
      </div>

      {/* Main Meal Logger Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lunch Selection */}
        <div className="stitch-card p-6 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" /> Lunch Selection
            </h2>
            <span className="text-xs font-bold text-[#4648d4]">₹{lunchCost}</span>
          </div>
          <p className="text-xs text-[#767586]">Select your lunch meal for {selectedDate}</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Full Meal', val: 'FULL', desc: `₹${fullPrice}` },
              { label: 'Half Meal', val: 'HALF', desc: `₹${halfPrice}` },
              { label: 'Skip Meal', val: 'SKIP', desc: '₹0' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => handleSaveMeal(item.val, dinner)}
                className={`p-3.5 rounded-xl text-center transition-all ${
                  lunch === item.val
                    ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20 border border-[#4648d4]'
                    : 'bg-white border border-slate-200 text-[#464554] hover:text-[#0b1c30]'
                }`}
              >
                <p className="font-bold text-xs">{item.label}</p>
                <p className="text-[11px] opacity-80 mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dinner Selection */}
        <div className="stitch-card p-6 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Dinner Selection
            </h2>
            <span className="text-xs font-bold text-[#4648d4]">₹{dinnerCost}</span>
          </div>
          <p className="text-xs text-[#767586]">Select your dinner meal for {selectedDate}</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Full Meal', val: 'FULL', desc: `₹${fullPrice}` },
              { label: 'Half Meal', val: 'HALF', desc: `₹${halfPrice}` },
              { label: 'Skip Meal', val: 'SKIP', desc: '₹0' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => handleSaveMeal(lunch, item.val)}
                className={`p-3.5 rounded-xl text-center transition-all ${
                  dinner === item.val
                    ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20 border border-[#4648d4]'
                    : 'bg-white border border-slate-200 text-[#464554] hover:text-[#0b1c30]'
                }`}
              >
                <p className="font-bold text-xs">{item.label}</p>
                <p className="text-[11px] opacity-80 mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="stitch-card p-4 bg-white flex items-center justify-between">
        <div>
          <span className="text-xs text-[#767586]">Selected Date Total Cost:</span>
          <p className="font-display font-bold text-2xl text-[#0b1c30]">₹{totalCost}</p>
        </div>
        <span className="text-xs text-[#006c49] font-semibold flex items-center gap-1.5 bg-[#e6f9f1] px-3 py-1.5 rounded-xl border border-[#6ffbbe]">
          <CheckCircle2 className="w-4 h-4" /> Auto-saved to Database
        </span>
      </div>

      {/* Calendar Grid with Real Status Tracking */}
      <div className="stitch-card p-6 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#4648d4]" />
              August 2026 Meal Calendar
            </h3>
            <p className="text-xs text-[#767586] mt-0.5">Click any day to update meal entries.</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-[#464554]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c49] inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1 text-[#464554]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Missing
            </span>
          </div>
        </div>

        {/* 31 Days Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isRecorded = recordedDayMap.has(day);
            const isToday = day === todayDay;
            const isMissing = !isRecorded && day < todayDay;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(`2026-08-${day < 10 ? '0' + day : day}`)}
                className={`p-3 rounded-xl text-center border transition-all text-xs font-bold ${
                  isToday
                    ? 'bg-[#4648d4] text-white border-[#4648d4] shadow-md'
                    : isRecorded
                    ? 'bg-[#e6f9f1] text-[#006c49] border-[#6ffbbe] hover:bg-[#d1f4e5]'
                    : isMissing
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-[#f8f9ff] text-[#464554] border-slate-200 hover:border-slate-300'
                }`}
              >
                Day {day}
                {isMissing && <span className="block text-[10px] text-amber-700 font-medium mt-0.5">Missing</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

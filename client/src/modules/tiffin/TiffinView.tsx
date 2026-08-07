import React, { useState, useEffect, useCallback } from 'react';
import { Utensils, Calendar as CalendarIcon, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/api';
import { useAutoDate } from '../../lib/dateUtils';

export const TiffinView: React.FC = () => {
  const { user } = useAuthStore();
  const { today, currentMonth } = useAutoDate();

  const [selectedDate, setSelectedDate] = useState(today);

  // Sync selectedDate with today when today changes at midnight
  useEffect(() => {
    setSelectedDate((prev) => (prev.startsWith(today.slice(0, 7)) ? today : prev));
  }, [today]);

  const [lunch, setLunch] = useState('SKIP');
  const [dinner, setDinner] = useState('SKIP');

  const [lunchCost, setLunchCost] = useState(0);
  const [dinnerCost, setDinnerCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [halfPrice, setHalfPrice] = useState(50);
  const [fullPrice, setFullPrice] = useState(80);
  const [monthMeals, setMonthMeals] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Current month label from selectedDate
  const displayMonth = selectedDate.slice(0, 7);
  const [year, monthNum] = displayMonth.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const monthLabel = new Date(year, monthNum - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const loadPrices = async () => {
    try {
      const prices = await api.get('/admin/prices');
      setHalfPrice(prices.halfPrice || 50);
      setFullPrice(prices.fullPrice || 80);
    } catch {
      // Use defaults
    }
  };

  const loadMonthMeals = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await api.get(`/meals/month?month=${displayMonth}`);
      setMonthMeals(data.meals || []);
    } catch {
      // keep existing
    }
  }, [user?.id, displayMonth]);

  const loadMealForDate = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = selectedDate === today
        ? await api.get('/meals/today')
        : await api.get(`/meals/month?month=${selectedDate.slice(0, 7)}`);

      if (selectedDate === today) {
        setLunch(data.lunch || 'SKIP');
        setDinner(data.dinner || 'SKIP');
        setLunchCost(data.lunchCost || 0);
        setDinnerCost(data.dinnerCost || 0);
        setTotalCost(data.totalCost || 0);
      } else {
        // Find the selected date's meal from month list
        const meal = (data.meals || []).find((m: any) => m.date === selectedDate || m.date?.startsWith(selectedDate));
        if (meal) {
          setLunch(meal.lunch || 'SKIP');
          setDinner(meal.dinner || 'SKIP');
          setLunchCost(meal.lunchCost || 0);
          setDinnerCost(meal.dinnerCost || 0);
          setTotalCost(meal.totalCost || 0);
        } else {
          setLunch('SKIP');
          setDinner('SKIP');
          setLunchCost(0);
          setDinnerCost(0);
          setTotalCost(0);
        }
      }
    } catch {
      // keep defaults
    }
  }, [user?.id, selectedDate, today]);

  useEffect(() => {
    loadPrices();
  }, []);

  useEffect(() => {
    loadMonthMeals();
    loadMealForDate();
  }, [loadMonthMeals, loadMealForDate]);

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
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await api.post('/meals', {
        date: selectedDate,
        lunch: newLunch,
        dinner: newDinner,
      });
      setSaveStatus('saved');
      await loadMonthMeals();
    } catch (err) {
      console.error('Failed to save meal:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const recordedDayMap = new Set(
    monthMeals.map((m) => {
      const d = new Date(m.date);
      return d.getUTCDate();
    })
  );
  const todayDay = new Date().getDate();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <Utensils className="w-8 h-8 text-[#4648d4]" />
            Tiffin &amp; Mess Tracker
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
                disabled={isSaving}
                className={`p-3.5 rounded-xl text-center transition-all ${
                  lunch === item.val
                    ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20 border border-[#4648d4]'
                    : 'bg-white border border-slate-200 text-[#464554] hover:text-[#0b1c30]'
                } disabled:opacity-60`}
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
                disabled={isSaving}
                className={`p-3.5 rounded-xl text-center transition-all ${
                  dinner === item.val
                    ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20 border border-[#4648d4]'
                    : 'bg-white border border-slate-200 text-[#464554] hover:text-[#0b1c30]'
                } disabled:opacity-60`}
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
        <span className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
          saveStatus === 'saving'
            ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-[#006c49] bg-[#e6f9f1] border-[#6ffbbe]'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {saveStatus === 'saving' ? 'Saving...' : 'Auto-saved to Database'}
        </span>
      </div>

      {/* Calendar Grid with Real Status Tracking */}
      <div className="stitch-card p-6 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#4648d4]" />
              {monthLabel} Meal Calendar
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

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isRecorded = recordedDayMap.has(day);
            const isToday = displayMonth === currentMonth && day === todayDay;
            const isMissing = displayMonth === currentMonth && !isRecorded && day < todayDay;
            const dayStr = `${displayMonth}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dayStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dayStr)}
                className={`p-3 rounded-xl text-center border transition-all text-xs font-bold ${
                  isSelected
                    ? 'ring-2 ring-[#4648d4] ring-offset-1'
                    : ''
                } ${
                  isToday
                    ? 'bg-[#4648d4] text-white border-[#4648d4] shadow-md'
                    : isRecorded
                    ? 'bg-[#e6f9f1] text-[#006c49] border-[#6ffbbe] hover:bg-[#d1f4e5]'
                    : isMissing
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-[#f8f9ff] text-[#464554] border-slate-200 hover:border-slate-300'
                }`}
              >
                {day}
                {isMissing && <span className="block text-[10px] text-amber-700 font-medium mt-0.5">Missing</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

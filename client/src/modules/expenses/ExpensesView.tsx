import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Edit2, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Tag, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export const ExpensesView: React.FC = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const categories = ['Food', 'Tea', 'Snacks', 'Grocery', 'Laundry', 'Travel', 'Medical', 'Shopping', 'Other'];

  // Load expenses from database
  const fetchExpenses = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        userId: user.id,
        search,
        category: selectedCategory,
        sortBy,
      });

      const res = await fetch(`/api/expenses?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user?.id, search, selectedCategory, sortBy]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !user?.id) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          category,
          amount: parseFloat(amount),
          note,
          date,
        }),
      });

      if (res.ok) {
        setAmount('');
        setNote('');
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editingExpense.category,
          amount: editingExpense.amount,
          note: editingExpense.note,
          date: editingExpense.date,
        }),
      });

      if (res.ok) {
        setEditingExpense(null);
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to update expense:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Pagination logic
  const totalPages = Math.ceil(expenses.length / itemsPerPage) || 1;
  const paginatedExpenses = expenses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <Receipt className="w-8 h-8 text-[#006c49]" />
            Daily Expense Logger
          </h1>
          <p className="text-[#464554] text-xs mt-1">
            Track daily personal expenses, snacks, travel, and hostel supplies.
          </p>
        </div>

        <div className="stitch-card px-5 py-2.5 bg-white border-[#e2e8f0]">
          <span className="text-xs text-[#767586] block">Total Logged Expenses:</span>
          <span className="font-display font-bold text-2xl text-[#006c49]">₹{totalExpenseSum}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expense Creation Form */}
        <div className="stitch-card p-6 bg-white space-y-5 h-fit">
          <h2 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#4648d4]" /> Log New Expense
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="What was this expense for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              <Plus className="w-4 h-4" /> Save Expense Record
            </button>
          </form>
        </div>

        {/* Expenses List & Controls */}
        <div className="lg:col-span-2 stitch-card p-6 bg-white space-y-5">
          {/* Controls Bar: Search, Category Filter, Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search note or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 py-2 text-xs"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field py-2 text-xs cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 text-xs cursor-pointer"
              >
                <option value="date_desc">Latest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* List Content / Empty State / Loading */}
          {isLoading ? (
            <p className="text-xs text-[#767586] text-center py-8">Loading expense records...</p>
          ) : expenses.length === 0 ? (
            /* Professional Empty State */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0b1c30]">No Expense Records Found</h3>
              <p className="text-xs text-[#767586] max-w-sm mx-auto">
                No daily expenses logged yet. Use the form to record your personal daily expenses.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {paginatedExpenses.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#4648d4] border border-[#d3e4fe] flex items-center justify-center font-bold text-xs">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0b1c30]">{item.category}</p>
                        {item.note && <p className="text-xs text-[#464554]">{item.note}</p>}
                        <p className="text-[11px] text-[#767586]">{item.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-sm text-[#0b1c30]">₹{item.amount}</span>
                      <button
                        onClick={() => setEditingExpense(item)}
                        className="p-1.5 text-slate-400 hover:text-[#4648d4] transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-[#767586]">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="btn-secondary py-1 px-3 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="btn-secondary py-1 px-3 disabled:opacity-40"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-base text-[#0b1c30]">Edit Expense Entry</h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">Category</label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  className="input-field text-xs cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">Date</label>
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                  className="input-field text-xs cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">Note</label>
                <input
                  type="text"
                  value={editingExpense.note || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, note: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingExpense(null)} className="btn-secondary text-xs py-2">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

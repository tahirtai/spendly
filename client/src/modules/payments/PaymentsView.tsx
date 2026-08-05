import React, { useState, useEffect } from 'react';
import { CreditCard, Upload, CheckCircle2, Clock, XCircle, Trash2, Smartphone, Banknote, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface PaymentRecord {
  id: string;
  type: 'CASH' | 'UPI';
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  screenshotPath?: string;
}

export const PaymentsView: React.FC = () => {
  const { user } = useAuthStore();
  const [paymentType, setPaymentType] = useState<'CASH' | 'UPI'>('UPI');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payments?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPaymentsList(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !user?.id) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: paymentType,
          amount: parseFloat(amount),
          note,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setAmount('');
        setNote('');
        fetchPayments();
      }
    } catch (err) {
      console.error('Failed to submit payment:', err);
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPayments();
    } catch (err) {
      console.error('Failed to delete payment:', err);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[#4648d4]" />
            Payment Tracking & Proof Upload
          </h1>
          <p className="text-[#464554] text-xs mt-1">
            Submit Cash or UPI payments with transaction screenshots for warden verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Submission Form */}
        <div className="stitch-card p-6 bg-white space-y-5 h-fit">
          <h2 className="font-display font-bold text-base text-[#0b1c30]">Record New Payment</h2>

          {/* Payment Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f8f9ff] rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPaymentType('UPI')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'UPI' ? 'bg-[#4648d4] text-white shadow-md' : 'text-[#464554] hover:text-[#0b1c30]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> UPI Payment
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('CASH')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'CASH' ? 'bg-[#4648d4] text-white shadow-md' : 'text-[#464554] hover:text-[#0b1c30]'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" /> Cash Payment
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Note / Reference</label>
              <input
                type="text"
                placeholder="e.g. August Mess Fee"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field"
              />
            </div>

            {/* UPI Screenshot Proof */}
            {paymentType === 'UPI' && (
              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">
                  UPI Screenshot Proof (PNG, JPEG ≤ 5MB)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-[#4648d4]/50 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#f8f9ff]">
                  <Upload className="w-7 h-7 text-[#4648d4] mx-auto mb-1.5" />
                  <p className="text-xs text-[#0b1c30] font-semibold">Click to upload UPI screenshot</p>
                  <p className="text-[10px] text-[#767586] mt-0.5">PNG, JPG or WEBP up to 5MB</p>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2">
              Submit Payment for Verification
            </button>
          </form>
        </div>

        {/* Payments History Table */}
        <div className="lg:col-span-2 stitch-card p-6 bg-white space-y-4">
          <h3 className="font-display font-bold text-base text-[#0b1c30]">Payment Submission History</h3>

          {isLoading ? (
            <p className="text-xs text-[#767586] text-center py-8">Loading payment records...</p>
          ) : paymentsList.length === 0 ? (
            /* Professional Empty State */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0b1c30]">No Payments Submitted Yet</h3>
              <p className="text-xs text-[#767586] max-w-sm mx-auto">
                No payment receipts found. Submit cash or UPI payments to settle outstanding dues.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paymentsList.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#eff4ff] border border-[#d3e4fe] flex items-center justify-center font-bold text-[#4648d4]">
                      {item.type === 'UPI' ? <Smartphone className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0b1c30]">{item.note || `${item.type} Payment`}</p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-50 text-[#006c49] border border-emerald-200'
                              : item.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#767586] mt-0.5">{item.date} • {item.type} Method</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-base text-[#006c49]">+₹{item.amount}</span>
                    <button
                      onClick={() => handleDeletePayment(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

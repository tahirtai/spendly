import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  DollarSign, 
  Users, 
  RefreshCw, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Image,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api, ApiError } from '../../lib/api';
import { UpdateMealPricesSchema } from 'spendly-shared';

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

interface PendingPayment {
  id: string;
  userId: string;
  type: string;
  amount: number;
  date: string;
  note?: string;
  screenshotPath?: string | null;
  user?: { fullName: string; email: string };
}

export const AdminView: React.FC = () => {
  const { user } = useAuthStore();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const [halfPrice, setHalfPrice] = useState(40);
  const [fullPrice, setFullPrice] = useState(60);
  const [isMonthLocked, setIsMonthLocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [priceError, setPriceError] = useState('');

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const itemsPerPage = 5;

  // Pending Payments Queue
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  // Signed URL viewer
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      const [priceData, mData, payData] = await Promise.all([
        api.get('/admin/prices').catch(() => null),
        api.get('/admin/members').catch(() => null),
        api.get('/admin/pending-payments').catch(() => null),
      ]);

      if (priceData) {
        setHalfPrice(priceData.halfPrice || 40);
        setFullPrice(priceData.fullPrice || 60);
      }
      if (mData) setMembers(mData.members || []);
      if (payData) setPendingPayments(payData.pendingPayments || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setPriceError('');

    const result = UpdateMealPricesSchema.safeParse({ halfPrice, fullPrice });
    if (!result.success) {
      setPriceError(result.error.issues[0]?.message || 'Invalid prices.');
      return;
    }

    try {
      await api.post('/admin/prices', { halfPrice, fullPrice });
      setSaveStatus('Meal prices updated successfully!');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err: any) {
      setPriceError(err instanceof ApiError ? err.message : 'Failed to save prices.');
    }
  };

  const handleRoleChange = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/members/${memberId}/role`, { role: newRole });
      loadAdminData();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.message : 'Failed to update member role.');
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`${status === 'APPROVED' ? 'Approve' : 'Reject'} this payment?`)) return;
    try {
      await api.patch(`/admin/payments/${paymentId}/status`, {
        status,
        verifiedBy: user?.fullName || 'Admin',
      });
      loadAdminData();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.message : 'Failed to verify payment.');
    }
  };

  const handleViewProof = async (paymentId: string) => {
    try {
      const data = await api.get(`/payments/${paymentId}/proof-url`);
      if (data.signedUrl) {
        setViewingProof(data.signedUrl);
      }
    } catch (err: any) {
      alert(err instanceof ApiError ? err.message : 'Could not load screenshot.');
    }
  };

  const handleMonthLockToggle = async () => {
    const nextState = !isMonthLocked;
    const action = nextState ? `Lock ${currentMonthLabel} Month` : `Unlock ${currentMonthLabel} Month`;
    if (!confirm(`${action}? This will generate monthly snapshots for all residents.`)) return;

    setIsMonthLocked(nextState);
    try {
      await api.post('/admin/month-lock', { month: currentMonth, lock: nextState });
    } catch (err: any) {
      setIsMonthLocked(!nextState); // revert
      alert(err instanceof ApiError ? err.message : 'Failed to toggle month lock.');
    }
  };

  // Filtered members
  const filteredMembers = members.filter(m =>
    m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice((memberPage - 1) * itemsPerPage, memberPage * itemsPerPage);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#c05400]" />
              Warden Admin Control Panel
            </h1>
            <span className="text-xs bg-[#fff2e6] text-[#c05400] border border-[#ffdbca] px-2.5 py-0.5 rounded-full font-bold uppercase">
              Admin Mode
            </span>
          </div>
          <p className="text-[#464554] text-xs mt-1">
            Manage residents, verify payment proofs, set meal rates, and lock monthly billing cycles.
          </p>
        </div>

        <button
          onClick={handleMonthLockToggle}
          className={`btn-secondary text-xs font-bold ${
            isMonthLocked ? 'bg-amber-100 text-amber-900 border-amber-300' : ''
          }`}
        >
          {isMonthLocked ? <Lock className="w-4 h-4 text-amber-700" /> : <Unlock className="w-4 h-4 text-[#767586]" />}
          {isMonthLocked ? `Locked (${currentMonthLabel})` : `Lock ${currentMonthLabel}`}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Price Versioning & Workspace Settings */}
        <div className="space-y-6">
          <div className="stitch-card p-6 bg-white space-y-4">
            <h2 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#4648d4]" /> Meal Rate Versioning
            </h2>
            <p className="text-xs text-[#767586]">
              Updating prices affects only future meal logs. Historical months preserve old rates.
            </p>

            {priceError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{priceError}</span>
              </div>
            )}

            <form onSubmit={handleSavePrices} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">Half Meal Rate (₹)</label>
                <input
                  type="number"
                  value={halfPrice}
                  onChange={(e) => setHalfPrice(Number(e.target.value))}
                  className="input-field text-xs"
                  min="0" step="0.5" required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">Full Meal Rate (₹)</label>
                <input
                  type="number"
                  value={fullPrice}
                  onChange={(e) => setFullPrice(Number(e.target.value))}
                  className="input-field text-xs"
                  min="0" step="0.5" required
                />
              </div>

              {saveStatus && (
                <p className="text-xs text-[#006c49] font-semibold text-center">{saveStatus}</p>
              )}

              <button type="submit" className="btn-primary w-full text-xs mt-2">
                <RefreshCw className="w-3.5 h-3.5" /> Save Meal Prices
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pending Verification Queue & User Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Payment Approvals */}
          <div className="stitch-card p-6 bg-white space-y-4">
            <h2 className="font-display font-bold text-base text-[#0b1c30]">
              Pending Payment Verification Queue ({pendingPayments.length})
            </h2>

            {pendingPayments.length === 0 ? (
              <p className="text-xs text-[#767586] py-6 text-center">No pending payment submissions awaiting verification.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingPayments.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0b1c30] truncate">
                        {item.user?.fullName || 'Resident'} — {item.note || 'Payment Submission'}
                      </p>
                      <p className="text-xs text-[#767586]">{item.date} • {item.type} • ₹{item.amount}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.screenshotPath && (
                        <button
                          onClick={() => handleViewProof(item.id)}
                          className="btn-secondary text-xs py-1 px-2.5"
                          title="View Screenshot"
                        >
                          <Image className="w-3.5 h-3.5" /> Proof
                        </button>
                      )}
                      <button
                        onClick={() => handleVerifyPayment(item.id, 'APPROVED')}
                        className="btn-primary text-xs py-1.5 px-3 bg-[#006c49] hover:bg-[#005438] shadow-[#006c49]/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(item.id, 'REJECTED')}
                        className="btn-danger text-xs py-1.5 px-3"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Management List */}
          <div className="stitch-card p-6 bg-white space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-display font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4648d4]" /> Resident User Management ({members.length})
              </h2>

              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="input-field pl-8 py-1.5 text-xs"
                />
              </div>
            </div>

            {paginatedMembers.length === 0 ? (
              <p className="text-xs text-[#767586] py-6 text-center">No resident accounts registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {paginatedMembers.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0b1c30]">{m.fullName}</p>
                      <p className="text-xs text-[#767586]">{m.email} • Role: <span className="font-semibold capitalize">{m.role.toLowerCase()}</span></p>
                    </div>

                    {m.role !== 'SUPER_ADMIN' && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && m.id !== user?.id && (
                      <button
                        onClick={() => handleRoleChange(m.id, m.role)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                          m.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            : 'bg-[#eff4ff] text-[#4648d4] border-[#d3e4fe] hover:bg-[#e5eeff]'
                        }`}
                      >
                        {m.role === 'ADMIN' ? 'Demote to Student' : 'Promote to Admin'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-[#767586]">
                <span>Page {memberPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={memberPage === 1}
                    onClick={() => setMemberPage(memberPage - 1)}
                    className="btn-secondary py-1 px-2.5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    disabled={memberPage === totalPages}
                    onClick={() => setMemberPage(memberPage + 1)}
                    className="btn-secondary py-1 px-2.5 disabled:opacity-40"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screenshot Proof Viewer Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#0b1c30]">Payment Screenshot Proof</h3>
              <button onClick={() => setViewingProof(null)} className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 border border-slate-200 rounded-lg">Close</button>
            </div>
            <img
              src={viewingProof}
              alt="Payment Proof Screenshot"
              className="w-full max-h-96 object-contain rounded-xl border border-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

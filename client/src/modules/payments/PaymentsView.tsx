import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Upload, CheckCircle2, Trash2, Smartphone, Banknote, AlertCircle, X, Image } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api, ApiError } from '../../lib/api';
import { SubmitPaymentSchema } from 'spendly-shared';

interface PaymentRecord {
  id: string;
  type: 'CASH' | 'UPI';
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string | null;
  screenshotPath?: string | null;
}

export const PaymentsView: React.FC = () => {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentType, setPaymentType] = useState<'CASH' | 'UPI'>('UPI');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  // Form state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPayments = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await api.get('/payments');
      setPaymentsList(data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFormErrors({ file: 'Only PNG, JPEG, or WEBP images allowed.' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({ file: 'File size must be under 5MB.' });
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setFormErrors({});
    setUploadedPath(null);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setFormErrors({});

    try {
      const formData = new FormData();
      formData.append('screenshot', selectedFile);

      const data = await api.uploadFile<{ success: boolean; path: string }>('/payments/upload-proof', formData);
      setUploadedPath(data.path);
    } catch (err: any) {
      setFormErrors({ file: err instanceof ApiError ? err.message : 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadedPath(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMsg('');

    // Validate UPI requires screenshot upload
    if (paymentType === 'UPI' && selectedFile && !uploadedPath) {
      setFormErrors({ file: 'Please upload the UPI screenshot before submitting.' });
      return;
    }

    const result = SubmitPaymentSchema.safeParse({
      type: paymentType,
      amount: parseFloat(amount),
      note: note || undefined,
      date: paymentDate,
      screenshotPath: uploadedPath || undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        errors[field] = (msgs as string[])[0];
      }
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/payments', result.data);
      setAmount('');
      setNote('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      handleClearFile();
      setSuccessMsg('Payment submitted successfully and pending verification!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchPayments();
    } catch (err: any) {
      setFormErrors({ form: err instanceof ApiError ? err.message : 'Submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Delete this payment record?')) return;
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete payment.');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Light Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[#4648d4]" />
            Payment Tracking &amp; Proof Upload
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

          {formErrors.form && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formErrors.form}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

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
                className={`input-field ${formErrors.amount ? 'border-rose-400' : ''}`}
                min="0.01" step="0.01" required
              />
              {formErrors.amount && <p className="text-rose-500 text-[11px] mt-1">{formErrors.amount}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#464554] block mb-1">Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="input-field cursor-pointer"
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
                maxLength={200}
              />
            </div>

            {/* UPI Screenshot Proof Upload */}
            {paymentType === 'UPI' && (
              <div>
                <label className="text-xs font-semibold text-[#464554] block mb-1">
                  UPI Screenshot Proof <span className="text-slate-400 font-normal">(PNG, JPEG ≤ 5MB)</span>
                </label>

                {formErrors.file && (
                  <p className="text-rose-500 text-[11px] mb-2">{formErrors.file}</p>
                )}

                {/* File preview */}
                {filePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0] mb-2">
                    <img src={filePreview} alt="Screenshot preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {uploadedPath ? (
                      <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Uploaded
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleUploadFile}
                        disabled={isUploading}
                        className="absolute bottom-2 left-2 bg-[#4648d4] text-white text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Now'}
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#4648d4]/50 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#f8f9ff] block">
                    <Upload className="w-7 h-7 text-[#4648d4] mx-auto mb-1.5" />
                    <p className="text-xs text-[#0b1c30] font-semibold">Click to upload UPI screenshot</p>
                    <p className="text-[10px] text-[#767586] mt-0.5">PNG, JPG or WEBP up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Submitting...' : 'Submit Payment for Verification'}
            </button>
          </form>
        </div>

        {/* Payments History Table */}
        <div className="lg:col-span-2 stitch-card p-6 bg-white space-y-4">
          <h3 className="font-display font-bold text-base text-[#0b1c30]">Payment Submission History</h3>

          {isLoading ? (
            <p className="text-xs text-[#767586] text-center py-8">Loading payment records...</p>
          ) : paymentsList.length === 0 ? (
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
                      <p className="text-xs text-[#767586] mt-0.5">
                        {item.date} • {item.type} Method
                        {item.screenshotPath && (
                          <span className="ml-2 text-[#4648d4] font-medium flex items-center gap-0.5 inline-flex">
                            <Image className="w-3 h-3" /> Screenshot
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-base text-[#006c49]">+₹{item.amount}</span>
                    {item.status === 'PENDING' && (
                      <button
                        onClick={() => handleDeletePayment(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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

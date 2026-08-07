import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Upload, CheckCircle2, Trash2, Smartphone, Banknote, AlertCircle, X, Image, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api, ApiError } from '../../lib/api';
import { SubmitPaymentSchema } from 'spendly-shared';
import { useAutoDate } from '../../lib/dateUtils';

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
  const { today } = useAutoDate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentType, setPaymentType] = useState<'CASH' | 'UPI'>('UPI');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(today);

  // Sync date when today changes at midnight
  useEffect(() => {
    setPaymentDate(today);
  }, [today]);

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

  const uploadSelectedFile = async (file: File) => {
    setIsUploading(true);
    setFormErrors({});
    setUploadedPath(null);

    try {
      const formData = new FormData();
      formData.append('screenshot', file);

      const data = await api.uploadFile<{ success: boolean; path: string }>('/payments/upload-proof', formData);
      setUploadedPath(data.path);
    } catch (err: any) {
      setUploadedPath(null);
      setFormErrors({ file: err instanceof ApiError ? err.message : 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

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

    // Auto upload file immediately
    uploadSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadedPath(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMsg('');

    if (isUploading) {
      setFormErrors({ file: 'Please wait for the screenshot upload to complete.' });
      return;
    }

    // Validate UPI requires screenshot upload
    if (paymentType === 'UPI' && !uploadedPath) {
      setFormErrors({ file: 'UPI payment requires a valid uploaded screenshot proof.' });
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
      setPaymentDate(today);
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
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-[#4648d4]" />
          Record Payments &amp; UPI Verification
        </h1>
        <p className="text-[#464554] text-xs mt-1">
          Submit UPI screenshot proofs or record cash payments for warden approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Submission Form */}
        <div className="stitch-card p-6 bg-white space-y-4">
          <h2 className="font-display font-bold text-base text-[#0b1c30]">Submit New Payment</h2>

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
              onClick={() => {
                setPaymentType('UPI');
                setFormErrors({});
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'UPI' ? 'bg-[#4648d4] text-white shadow-md' : 'text-[#464554] hover:text-[#0b1c30]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> UPI Payment
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentType('CASH');
                setFormErrors({});
              }}
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
                  UPI Screenshot Proof <span className="text-rose-500 font-bold">*Required</span>
                </label>

                {formErrors.file && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2.5 rounded-lg mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formErrors.file}</span>
                  </div>
                )}

                {/* File preview & upload status */}
                {filePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-2 bg-slate-50 p-2">
                    <div className="relative h-44 rounded-lg overflow-hidden border border-slate-200">
                      <img src={filePreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-all"
                        title="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between px-1 text-xs">
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading screenshot to Supabase Storage...</span>
                        </div>
                      ) : uploadedPath ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Uploaded successfully</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                          <AlertCircle className="w-4 h-4" />
                          <span>Upload failed. Please re-select file.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#4648d4] rounded-xl p-6 text-center cursor-pointer transition-all bg-[#f8f9ff]"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#0b1c30]">Click to select payment screenshot</p>
                    <p className="text-[11px] text-[#767586] mt-0.5">PNG, JPEG or WEBP (Max 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isUploading || (paymentType === 'UPI' && !uploadedPath)}
              className="btn-primary w-full text-xs py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isSubmitting
                  ? 'Submitting Payment...'
                  : isUploading
                  ? 'Uploading Screenshot...'
                  : 'Submit Payment'}
              </span>
            </button>
          </form>
        </div>

        {/* Payment History List */}
        <div className="lg:col-span-2 stitch-card p-6 bg-white space-y-4">
          <h2 className="font-display font-bold text-base text-[#0b1c30]">My Payment History</h2>

          {isLoading ? (
            <p className="text-xs text-[#767586] text-center py-8">Loading payments...</p>
          ) : paymentsList.length === 0 ? (
            <p className="text-xs text-[#767586] text-center py-8">No payment records submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {paymentsList.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0b1c30] text-sm">₹{item.amount}</span>
                      <span className="text-xs bg-slate-100 text-[#464554] px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                        {item.type}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
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
                    <p className="text-xs text-[#767586]">{item.date} {item.note ? `• ${item.note}` : ''}</p>
                  </div>

                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => handleDeletePayment(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                      title="Delete pending payment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

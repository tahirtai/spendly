import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  UtensilsCrossed,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Receipt,
  ChevronDown,
  Zap,
  Users,
  HelpCircle,
  ChevronDown as ArrowDownIcon,
} from 'lucide-react';
import { SpendlyLogo } from '../../components/SpendlyLogo';

export const LandingView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Spendly calculate my monthly tiffin expenses?',
      a: 'Your hostel or PG admin sets custom meal rates (e.g. ₹80 Full / ₹50 Half). Every day you mark your lunch and dinner choices in one tap, and Spendly automatically compiles your exact monthly meal total without any manual calculation mistakes.',
    },
    {
      q: 'How do UPI payment screenshot proofs work?',
      a: 'When you pay your monthly mess fee or rent via Google Pay, PhonePe, or Paytm, simply upload the screenshot proof in the Payments view. Your warden verifies the upload in their Admin Console, instantly settling your balance.',
    },
    {
      q: 'What happens if I forget to mark my meal for a day?',
      a: 'Spendly flags missing entries so you can easily update your choices before the monthly billing cycle locks. Admins can also manage default meal statuses for unrecorded days.',
    },
    {
      q: 'Can I view past months and download expense history?',
      a: 'Yes! All past monthly cycles are locked and archived in the History section. You can view itemized category breakdowns for meals, daily room expenses, and approved payments anytime.',
    },
  ];

  return (
    <div className="spendly-stage min-h-screen text-[#1b1b1d]">
      <div className="spendly-mobile-shell min-h-screen flex flex-col overflow-hidden">
        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-2xl flex-shrink-0">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center">
              <SpendlyLogo variant="full" size="md" className="h-8 md:h-9 w-auto" />
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary px-3.5 py-1.5 text-xs font-bold text-[#0b1c30]">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary px-3.5 py-1.5 text-xs font-bold shadow-md shadow-indigo-500/20">
                Join Now
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
          {/* First Hero Screen Container — Engineered to fit 100% perfectly in mobile viewport height */}
          <section className="min-h-[calc(100dvh-58px)] flex flex-col justify-between items-center text-center px-5 pt-6 pb-6 relative">
            <div className="flex flex-col items-center gap-4 my-auto max-w-sm">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#4441cc] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#5e5ce6]" />
                Smart Hostel &amp; PG Platform
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-[30px] sm:text-[34px] font-extrabold leading-[1.14] tracking-tight text-[#0b1c30]">
                Effortless Tiffin, Expenses &amp; UPI Settlement
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm leading-relaxed text-[#6b7280]">
                Eliminate spreadsheet chaos, meal calculation disputes, and lost receipts. Track daily tiffins, split roommate bills, and submit instant UPI payment proofs.
              </p>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5 pt-2">
                <Link to="/register" className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/25">
                  Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
                <Link to="/login" className="btn-secondary w-full py-3 text-sm font-bold text-[#0b1c30]">
                  Sign In to Workspace
                </Link>
              </div>
            </div>

            {/* Scroll Indicator at bottom of first hero screen */}
            <div className="pt-4 flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#767586]">
                Scroll for features
              </span>
              <div className="animate-bounce p-1 rounded-full bg-white/80 border border-slate-200 shadow-2xs text-indigo-600">
                <ArrowDownIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </section>

          {/* Body Sections (Revealed upon scrolling) */}
          <div className="px-5 pb-20 space-y-10">
            {/* Live Interactive App Preview Cards */}
            <section className="w-full text-left">
              <div className="bg-gradient-to-br from-indigo-950 via-[#1e1b4b] to-[#312e81] text-white p-4 sm:p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden border border-indigo-500/20">
                <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">Live Workspace Status</span>
                  </div>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-indigo-100 font-semibold border border-white/10">Active Month</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-indigo-200 uppercase font-semibold">Today's Tiffin</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">Lunch + Half</p>
                    <p className="text-[10px] text-emerald-300 font-semibold mt-1">₹130 Recorded</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-indigo-200 uppercase font-semibold">Remaining Due</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">₹380.00</p>
                    <p className="text-[10px] text-indigo-200 font-semibold mt-1">Proof Uploaded</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Metrics & Benefits Bar */}
            <section className="grid grid-cols-3 gap-2 text-center">
              <div className="stitch-card p-3 bg-white space-y-1 shadow-md shadow-indigo-900/5">
                <Zap className="w-5 h-5 text-indigo-600 mx-auto" />
                <p className="text-base font-extrabold text-[#0b1c30]">&lt; 10s</p>
                <p className="text-[10px] text-[#767586] font-medium">Daily Meal Mark</p>
              </div>
              <div className="stitch-card p-3 bg-white space-y-1 shadow-md shadow-indigo-900/5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-base font-extrabold text-[#0b1c30]">100%</p>
                <p className="text-[10px] text-[#767586] font-medium">UPI Verified</p>
              </div>
              <div className="stitch-card p-3 bg-white space-y-1 shadow-md shadow-indigo-900/5">
                <Users className="w-5 h-5 text-purple-600 mx-auto" />
                <p className="text-base font-extrabold text-[#0b1c30]">0</p>
                <p className="text-[10px] text-[#767586] font-medium">Meal Disputes</p>
              </div>
            </section>

            {/* Core Features Grid */}
            <section className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="font-display text-2xl font-extrabold text-[#0b1c30]">Built for Hostels &amp; PGs</h2>
                <p className="text-xs text-[#767586]">Everything students and wardens need in one place.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="stitch-card p-5 bg-white space-y-3 border border-slate-100 shadow-md shadow-indigo-900/5 hover:border-indigo-200 transition-all">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <UtensilsCrossed className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0b1c30]">One-Click Tiffin Tracker</h3>
                    <p className="text-xs leading-relaxed text-[#767586] mt-1">
                      Mark daily lunch and dinner selections (Full, Half, Skip) with versioned workspace meal pricing.
                    </p>
                  </div>
                </div>

                <div className="stitch-card p-5 bg-white space-y-3 border border-slate-100 shadow-md shadow-indigo-900/5 hover:border-emerald-200 transition-all">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CreditCard className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0b1c30]">UPI Screenshot Verification</h3>
                    <p className="text-xs leading-relaxed text-[#767586] mt-1">
                      Upload GPay/PhonePe/Paytm screenshot proofs directly to cloud storage for instant warden approval.
                    </p>
                  </div>
                </div>

                <div className="stitch-card p-5 bg-white space-y-3 border border-slate-100 shadow-md shadow-indigo-900/5 hover:border-purple-200 transition-all">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Receipt className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0b1c30]">Shared Expense Manager</h3>
                    <p className="text-xs leading-relaxed text-[#767586] mt-1">
                      Record groceries, Wi-Fi, electricity, and room purchases with transparent roommate ledger splits.
                    </p>
                  </div>
                </div>

                <div className="stitch-card p-5 bg-white space-y-3 border border-slate-100 shadow-md shadow-indigo-900/5 hover:border-amber-200 transition-all">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShieldCheck className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0b1c30]">Warden Admin Panel</h3>
                    <p className="text-xs leading-relaxed text-[#767586] mt-1">
                      Manage residents, verify payment proofs, update meal rates, and lock monthly billing cycles.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Step-by-Step */}
            <section className="stitch-card p-6 bg-white space-y-5 shadow-lg shadow-indigo-900/5">
              <h2 className="font-display text-xl font-extrabold text-[#0b1c30] text-center">How Spendly Works</h2>

              <div className="space-y-4 relative">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0b1c30]">Join Your Workspace</h4>
                    <p className="text-xs text-[#767586] mt-0.5">Sign in with student credentials assigned to your PG or hostel.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0b1c30]">Mark Daily Tiffin</h4>
                    <p className="text-xs text-[#767586] mt-0.5">Tap your lunch and dinner choices daily before the cutoff deadline.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0b1c30]">Upload UPI Payment Proof</h4>
                    <p className="text-xs text-[#767586] mt-0.5">Scan UPI QR code, pay via GPay/PhonePe, and attach your screenshot.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0b1c30]">Instant Warden Verification</h4>
                    <p className="text-xs text-[#767586] mt-0.5">Warden approves the payment, settling your monthly balance with zero disputes.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider justify-center">
                <HelpCircle className="w-4 h-4" /> FAQ
              </div>
              <h2 className="font-display text-2xl font-extrabold text-[#0b1c30] text-center">Frequently Asked Questions</h2>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="stitch-card bg-white overflow-hidden border border-slate-100 shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-2 font-bold text-xs md:text-sm text-[#0b1c30]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="px-4 pb-4 text-xs leading-relaxed text-[#767586] border-t border-slate-100 pt-3 animate-in fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Call to Action Card */}
            <section className="rounded-3xl p-6 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white text-center space-y-4 shadow-xl shadow-indigo-950/30 border border-indigo-400/20">
              <SpendlyLogo variant="full" size="lg" className="h-10 w-auto mx-auto drop-shadow-md" lightText />
              <h3 className="font-display text-xl font-extrabold text-white tracking-tight">Ready for Stress-Free Expense Tracking?</h3>
              <p className="text-xs font-medium text-indigo-100/90 leading-relaxed max-w-xs mx-auto">
                Start managing your hostel tiffin and shared PG bills with Spendly today.
              </p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="w-full py-3.5 px-4 rounded-full font-extrabold text-xs sm:text-sm bg-white text-[#312e81] hover:bg-slate-50 active:scale-[0.98] shadow-lg shadow-black/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4 text-[#312e81]" />
                </Link>
              </div>
            </section>

            {/* Footer Branding */}
            <footer className="text-center space-y-2 pt-4 pb-6 border-t border-slate-200">
              <SpendlyLogo variant="full" size="sm" className="h-6 w-auto mx-auto opacity-75" />
              <p className="text-[11px] text-[#767586]">© 2026 Spendly. All rights reserved.</p>
              <p className="text-[10px] text-[#767586]">Hostel &amp; PG Expense Platform</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

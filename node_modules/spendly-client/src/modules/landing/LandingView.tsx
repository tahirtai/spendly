import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, Receipt, ShieldCheck, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LandingView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between font-sans">
      {/* Light Header Navigation */}
      <header className="border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shadow-md shadow-[#4648d4]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[#0b1c30] tracking-tight">Spendly</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-secondary text-xs px-4">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-xs px-5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eff4ff] border border-[#d3e4fe] text-[#4648d4] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> SaaS-Ready Hostel & PG Expense Management
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-extrabold text-[#0b1c30] tracking-tight max-w-4xl leading-tight">
          Effortless Tiffin & Expense Tracking for Hostel Residents
        </h1>

        <p className="text-base md:text-lg text-[#464554] max-w-2xl font-normal leading-relaxed">
          Eliminate manual calculations, meal disputes, and lost payment receipts. Track daily meals, log personal expenses, and submit UPI payment proofs seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link to="/register" className="btn-primary text-sm px-8 py-3.5 text-base">
            Get Started Now <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary text-sm px-8 py-3.5 text-base">
            Sign In to Workspace
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-12 w-full max-w-5xl">
          <div className="stitch-card p-6 bg-white space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#4648d4] flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0b1c30]">One-Click Tiffin Tracker</h3>
            <p className="text-xs text-[#464554] leading-relaxed">
              Record daily lunch and dinner selections (Half, Full, Skip) with versioned workspace meal pricing.
            </p>
          </div>

          <div className="stitch-card p-6 bg-white space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6f9f1] text-[#006c49] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0b1c30]">UPI Screenshot Verification</h3>
            <p className="text-xs text-[#464554] leading-relaxed">
              Upload payment proofs directly to Supabase Storage with instant balance settlements.
            </p>
          </div>

          <div className="stitch-card p-6 bg-white space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff2e6] text-[#c05400] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0b1c30]">Warden Admin Panel</h3>
            <p className="text-xs text-[#464554] leading-relaxed">
              Manage residents, verify payments, update meal rates, and lock monthly billing cycles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-[#767586]">
          © 2026 Spendly Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

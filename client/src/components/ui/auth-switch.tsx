import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Lock, Mail, User, Phone, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { api, ApiError } from "@/lib/api";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { LoginSchema, RegisterSchema } from "spendly-shared";
import { SpendlyLogo } from "../SpendlyLogo";

export interface AuthSwitchProps {
  initialMode?: "login" | "register";
  onModeChange?: (mode: "login" | "register") => void;
  className?: string;
  defaultEmail?: string;
}

export const Component: React.FC<AuthSwitchProps> = ({
  initialMode = "login",
  onModeChange,
  className,
  defaultEmail = "",
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState(defaultEmail);
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const result = LoginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        errors[field] = (msgs as string[])[0];
      }
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post<{
        success: boolean;
        user: any;
        accessToken: string;
        session: { access_token: string; refresh_token: string } | null;
      }>("/auth/login", { email: loginEmail, password: loginPassword });

      // Hand the full Supabase session (including refresh token) to the browser
      // Supabase client.  This enables automatic silent token refresh and
      // persistent login across page refreshes and browser reopening.
      if (data.session?.access_token && data.session?.refresh_token) {
        await supabaseBrowser.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setUser(data.user, data.accessToken);

      if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});

    const result = RegisterSchema.safeParse({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      phone: regPhone || undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        errors[field] = (msgs as string[])[0];
      }
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
      });

      setSuccessMsg("Account registered successfully! Switching to sign in...");
      setLoginEmail(regEmail);
      setTimeout(() => {
        switchMode("login");
      }, 1400);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full mx-auto overflow-hidden bg-white/90 backdrop-blur-3xl rounded-[2rem] border border-white/90 shadow-[0_25px_70px_-15px_rgba(30,27,75,0.32),0_12px_30px_-5px_rgba(79,70,229,0.22)] grid grid-cols-1",
        className
      )}
    >
      {/* Left / Side Visual Feature Card */}
      <div className="relative hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-8 text-white flex-col justify-between overflow-hidden shadow-inner">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop')",
          }}
        />

        <div className="relative z-10 space-y-4">
          <SpendlyLogo variant="icon" size="lg" className="h-12 w-12 drop-shadow-xl" />
          <h2 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm">Spendly Platform</h2>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            Smart hostel &amp; PG expense splitting, automated tiffin management, and transparent monthly ledger for roommates.
          </p>
        </div>

        <div className="relative z-10 space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 text-xs text-indigo-100">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 drop-shadow-xs" />
            <span>Role-based access &amp; instant audit log</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-indigo-100">
            <CheckCircle2 className="w-4 h-4 text-indigo-300 flex-shrink-0 drop-shadow-xs" />
            <span>Automated settlement calculations</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Form Column */}
      <div className="p-5 sm:p-6 flex flex-col justify-center bg-gradient-to-b from-white/95 to-slate-50/90">
        {/* Spendly Brand Logo Header */}
        <div className="flex justify-center mb-3">
          <SpendlyLogo variant="full" size="md" className="h-9 w-auto drop-shadow-xs" />
        </div>
        {/* Animated Segmented Tab Switcher */}
        <div className="relative flex p-1 bg-slate-100/90 rounded-2xl mb-4 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_8px_rgba(31,38,135,0.08)]">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={cn(
              "relative z-10 flex-1 py-2 text-xs font-bold rounded-xl transition-colors duration-200",
              mode === "login" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={cn(
              "relative z-10 flex-1 py-2 text-xs font-bold rounded-xl transition-colors duration-200",
              mode === "register" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Create Account
          </button>
          <motion.div
            className="absolute inset-y-1 bg-white rounded-xl shadow-md shadow-slate-900/15 border border-white"
            initial={false}
            animate={{
              left: mode === "login" ? "4px" : "50%",
              width: "calc(50% - 4px)",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2.5 rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-2.5 rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Animated Switch */}
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-3"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-0.5 tracking-tight">Welcome Back</h3>
                <p className="text-xs text-slate-500 mb-2">Enter credentials to access your hostel workspace</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={cn(
                      "w-full bg-white border border-slate-200/90 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300",
                      fieldErrors.email && "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    )}
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-rose-500 text-[11px] mt-0.5">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={cn(
                      "w-full bg-white border border-slate-200/90 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300",
                      fieldErrors.password && "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    )}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-rose-500 text-[11px] mt-0.5">{fieldErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5e5ce6] hover:bg-[#4441cc] text-white font-bold text-xs py-3 rounded-full shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1"
              >
                <span>{isLoading ? "Signing In..." : "Sign In to Spendly"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register-form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegister}
              className="space-y-2.5"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-0.5 tracking-tight">Create Student Account</h3>
                <p className="text-[11px] text-slate-500 mb-1.5">Track hostel meals &amp; shared bills easily</p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className={cn(
                      "w-full bg-white border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300",
                      fieldErrors.fullName && "border-rose-400"
                    )}
                    required
                  />
                </div>
                {fieldErrors.fullName && <p className="text-rose-500 text-[10px] mt-0.5">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={cn(
                      "w-full bg-white border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300",
                      fieldErrors.email && "border-rose-400"
                    )}
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-rose-500 text-[10px] mt-0.5">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={cn(
                      "w-full bg-white border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300",
                      fieldErrors.password && "border-rose-400"
                    )}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-rose-500 text-[10px] mt-0.5">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5e5ce6] hover:bg-[#4441cc] text-white font-bold text-xs py-2.5 rounded-full shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1.5"
              >
                <span>{isLoading ? "Registering..." : "Create Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Component;

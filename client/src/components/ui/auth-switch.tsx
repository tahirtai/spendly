import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Lock, Mail, User, Phone, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { api, ApiError } from "@/lib/api";
import { LoginSchema, RegisterSchema } from "spendly-shared";

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
      }>("/auth/login", { email: loginEmail, password: loginPassword });

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
        "w-full max-w-4xl mx-auto overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl shadow-indigo-500/10 grid grid-cols-1 md:grid-cols-12",
        className
      )}
    >
      {/* Left / Side Visual Feature Card */}
      <div className="relative hidden md:flex md:col-span-5 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-8 text-white flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop')",
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-200" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">Spendly Platform</h2>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            Smart hostel &amp; PG expense splitting, automated tiffin management, and transparent monthly ledger for roommates.
          </p>
        </div>

        <div className="relative z-10 space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 text-xs text-indigo-100">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Role-based access &amp; instant audit log</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-indigo-100">
            <CheckCircle2 className="w-4 h-4 text-indigo-300 flex-shrink-0" />
            <span>Automated settlement calculations</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Form Column */}
      <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
        {/* Animated Segmented Tab Switcher */}
        <div className="relative flex p-1 bg-slate-100/80 rounded-2xl mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={cn(
              "relative z-10 flex-1 py-2.5 text-xs font-semibold rounded-xl transition-colors duration-200",
              mode === "login" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={cn(
              "relative z-10 flex-1 py-2.5 text-xs font-semibold rounded-xl transition-colors duration-200",
              mode === "register" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Create Account
          </button>
          <motion.div
            className="absolute inset-y-1 bg-white rounded-xl shadow-sm border border-slate-200/50"
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
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-in fade-in">
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
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h3>
                <p className="text-xs text-slate-500 mb-4">Enter your credentials to access your hostel dashboard</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={cn(
                      "w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      fieldErrors.email && "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    )}
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-rose-500 text-[11px] mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={cn(
                      "w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      fieldErrors.password && "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    )}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-rose-500 text-[11px] mt-1">{fieldErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4648d4] hover:bg-[#3b3dbb] text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Create Student Account</h3>
                <p className="text-xs text-slate-500 mb-4">Join your hostel group and track shared expenses easily</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className={cn(
                      "w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      fieldErrors.fullName && "border-rose-400"
                    )}
                    required
                  />
                </div>
                {fieldErrors.fullName && <p className="text-rose-500 text-[11px] mt-1">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={cn(
                      "w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      fieldErrors.email && "border-rose-400"
                    )}
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-rose-500 text-[11px] mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={cn(
                      "w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      fieldErrors.password && "border-rose-400"
                    )}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-rose-500 text-[11px] mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4648d4] hover:bg-[#3b3dbb] text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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

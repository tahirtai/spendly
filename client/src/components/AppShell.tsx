import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  LayoutDashboard,
  Plus,
  Receipt,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { UserAvatar } from './UserAvatar';
import { SpendlyLogo } from './SpendlyLogo';

interface AppShellProps {
  children: React.ReactNode;
}

const LEFT_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/tiffin', label: 'Tiffin', icon: UtensilsCrossed },
] as const;

const RIGHT_NAV_ITEMS = [
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/payments', label: 'Payments', icon: CreditCard },
] as const;

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Scroll-aware bottom nav ──────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const [navVisible, setNavVisible] = useState(true);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) { ticking.current = false; return; }

      const currentY = el.scrollTop;
      const delta = currentY - lastScrollY.current;

      // Only act on meaningful scroll (ignore tiny noise)
      if (Math.abs(delta) > 6) {
        setNavVisible(delta < 0 || currentY < 60);
        lastScrollY.current = currentY;
      }

      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleCenterPlusClick = () => {
    if (location.pathname === '/expenses') {
      navigate(`/expenses?add=${Date.now()}`, { replace: true });
    } else {
      navigate('/expenses?add=true');
    }
  };

  return (
    <div className="spendly-stage text-[#1b1b1d]">
      <div className="spendly-mobile-shell">

        {/* ── App Header ──────────────────────────────────────────────────── */}
        <header className="app-header">
          {/* Spendly brand */}
          <div className="flex items-center">
            <SpendlyLogo variant="full" size="md" className="h-8 md:h-9 w-auto" />
          </div>

          {/* Profile avatar */}
          <NavLink
            to="/profile"
            title={user?.fullName ? `${user.fullName}'s profile` : 'Profile'}
            className={({ isActive }) =>
              `app-header-avatar ${isActive ? 'ring-2 ring-[#4648d4] ring-offset-2 ring-offset-white/50' : ''}`
            }
          >
            <UserAvatar user={user} size="sm" className="h-8 w-8" />
          </NavLink>
        </header>

        {/* ── Scrollable Content ───────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="shell-content no-scrollbar"
        >
          {children}
        </div>

        {/* ── Pill Bottom Navigation with Center Elevated Plus Button ──────────────── */}
        <div
          aria-label="Main navigation"
          className={`pill-nav-wrap ${navVisible ? 'pill-nav-visible' : 'pill-nav-hidden'}`}
        >
          <nav className="pill-nav px-2 py-1.5 flex items-center justify-between">
            {/* Left 2 Items */}
            {LEFT_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `pill-nav-item ${isActive ? 'pill-nav-item-active' : 'pill-nav-item-inactive'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`pill-nav-icon-wrap ${isActive ? 'pill-nav-icon-active' : ''}`}>
                      <Icon className="h-[17px] w-[17px]" />
                    </span>
                    <span className="pill-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Center Elevated Floating Plus Button */}
            <div className="relative -mt-6 px-1 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleCenterPlusClick}
                className="h-12 w-12 rounded-full bg-[#5e5ce6] hover:bg-[#4441cc] text-white ring-4 ring-white shadow-lg shadow-indigo-600/35 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Log New Expense"
              >
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Right 2 Items */}
            {RIGHT_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `pill-nav-item ${isActive ? 'pill-nav-item-active' : 'pill-nav-item-inactive'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`pill-nav-icon-wrap ${isActive ? 'pill-nav-icon-active' : ''}`}>
                      <Icon className="h-[17px] w-[17px]" />
                    </span>
                    <span className="pill-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

      </div>
    </div>
  );
};

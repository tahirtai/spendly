import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Receipt, 
  CreditCard, 
  History, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tiffin', label: 'Tiffin Tracker', icon: UtensilsCrossed },
    { to: '/expenses', label: 'Daily Expenses', icon: Receipt },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/history', label: 'Monthly History', icon: History },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' 
      ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }] 
      : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col justify-between p-5 min-h-screen sticky top-0 shadow-[2px_0_12px_rgba(70,72,212,0.03)] z-20">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shadow-md shadow-[#4648d4]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-[#0b1c30] tracking-tight">Spendly</h1>
            <span className="text-[10px] bg-[#e1e0ff] text-[#4648d4] font-semibold px-2 py-0.5 rounded-full border border-[#c0c1ff]">
              Hostel Platform
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#4648d4] text-white shadow-md shadow-[#4648d4]/20 font-semibold'
                    : 'text-[#464554] hover:text-[#0b1c30] hover:bg-[#eff4ff]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-[#e2e8f0] pt-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[#eff4ff] border border-[#d3e4fe] flex items-center justify-center font-bold text-[#4648d4] text-sm">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold text-[#0b1c30] truncate">{user?.fullName || 'Student User'}</p>
            <p className="text-xs text-[#767586] capitalize font-medium">{user?.role?.toLowerCase() || 'student'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 py-2 rounded-xl transition-colors border border-rose-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

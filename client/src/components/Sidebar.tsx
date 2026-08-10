import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Receipt, 
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { UserAvatar } from './UserAvatar';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/tiffin', label: 'Tiffin', icon: UtensilsCrossed },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <>
      <NavLink
        to="/profile"
        title={user?.fullName ? `Open ${user.fullName}'s profile` : 'Open profile'}
        className={({ isActive }) =>
          `fixed z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 shadow-[0_12px_28px_rgba(31,38,135,0.12)] backdrop-blur-2xl transition-all active:scale-95 ${
            isActive ? 'ring-2 ring-[#4648d4] ring-offset-2 ring-offset-transparent' : ''
          }`
        }
        style={{ right: 'max(1rem, calc(50% - 204px))', top: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <UserAvatar user={user} size="sm" className="h-9 w-9" />
      </NavLink>

      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border border-white/70 bg-white/85 px-3 pt-2 shadow-[0_-18px_42px_rgba(31,38,135,0.10)] backdrop-blur-2xl">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-[#4441cc]'
                    : 'text-[#777586] hover:text-[#4441cc]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#e2dfff] shadow-sm'
                        : 'bg-transparent'
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="max-w-full truncate leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

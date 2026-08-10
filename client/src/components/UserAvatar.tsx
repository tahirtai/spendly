import React from 'react';
import type { User } from '../store/useAuthStore';

interface UserAvatarProps {
  user: Pick<User, 'fullName' | 'email' | 'avatarUrl'> | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-16 w-16 text-lg',
  lg: 'h-24 w-24 text-2xl',
};

export function getUserInitials(user: Pick<User, 'fullName' | 'email'> | null | undefined) {
  const source = user?.fullName?.trim() || user?.email?.split('@')[0] || 'U';
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'sm', className = '' }) => {
  const baseClass = `${sizeClasses[size]} shrink-0 overflow-hidden rounded-full border border-white/80 bg-[#e2dfff] text-[#4441cc] shadow-sm`;

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName ? `${user.fullName} profile` : 'User profile'}
        className={`${baseClass} object-cover ${className}`}
      />
    );
  }

  return (
    <span className={`${baseClass} flex items-center justify-center font-display font-extrabold ${className}`}>
      {getUserInitials(user)}
    </span>
  );
};

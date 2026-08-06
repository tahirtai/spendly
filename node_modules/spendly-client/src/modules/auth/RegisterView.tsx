import React from 'react';
import AuthSwitch from '@/components/ui/auth-switch';

export const RegisterView: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f8f9ff]">
      <AuthSwitch initialMode="register" />
    </div>
  );
};

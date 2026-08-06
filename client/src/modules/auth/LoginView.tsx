import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthSwitch from '@/components/ui/auth-switch';

export const LoginView: React.FC = () => {
  const location = useLocation();
  const initialEmail = (location.state as any)?.registeredEmail || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f8f9ff]">
      <AuthSwitch initialMode="login" defaultEmail={initialEmail} />
    </div>
  );
};

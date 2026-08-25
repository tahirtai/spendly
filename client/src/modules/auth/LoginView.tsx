import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthSwitch from '@/components/ui/auth-switch';

export const LoginView: React.FC = () => {
  const location = useLocation();
  const initialEmail = (location.state as any)?.registeredEmail || '';

  return (
    <div className="spendly-stage min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="spendly-mobile-shell flex min-h-screen items-center justify-center px-4 py-6">
        <AuthSwitch initialMode="login" defaultEmail={initialEmail} className="my-auto" />
      </div>
    </div>
  );
};

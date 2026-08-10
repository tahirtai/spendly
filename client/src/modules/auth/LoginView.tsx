import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthSwitch from '@/components/ui/auth-switch';

export const LoginView: React.FC = () => {
  const location = useLocation();
  const initialEmail = (location.state as any)?.registeredEmail || '';

  return (
    <div className="spendly-stage min-h-screen">
      <div className="spendly-mobile-shell flex min-h-screen items-center px-5 py-10">
        <AuthSwitch initialMode="login" defaultEmail={initialEmail} />
      </div>
    </div>
  );
};

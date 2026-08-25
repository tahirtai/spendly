import React from 'react';
import AuthSwitch from '@/components/ui/auth-switch';

export const RegisterView: React.FC = () => {
  return (
    <div className="spendly-stage min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="spendly-mobile-shell flex min-h-screen items-center justify-center px-4 py-6">
        <AuthSwitch initialMode="register" className="my-auto" />
      </div>
    </div>
  );
};

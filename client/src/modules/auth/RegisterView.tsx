import React from 'react';
import AuthSwitch from '@/components/ui/auth-switch';

export const RegisterView: React.FC = () => {
  return (
    <div className="spendly-stage min-h-screen">
      <div className="spendly-mobile-shell flex min-h-screen items-center px-5 py-10">
        <AuthSwitch initialMode="register" />
      </div>
    </div>
  );
};

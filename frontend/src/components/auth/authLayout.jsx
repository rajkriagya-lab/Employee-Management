import React from "react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text">
            BizFlow
          </h1>

          <p className="mt-1 text-sm text-muted">
            Employee Management System
          </p>
        </div>

        {/* Auth Card */}
        <div className="
          bg-surface
          border
          border-border
          rounded-lg
          p-6
          sm:p-8
          shadow-sm
        ">
          {children}
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;
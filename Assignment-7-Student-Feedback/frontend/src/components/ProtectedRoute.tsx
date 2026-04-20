import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'instructor' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(234,88,12,0.18),_transparent_28%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.45)_100%)] px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/90 p-10 text-center shadow-2xl shadow-black/5">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          </div>
          <h1 className="text-xl font-semibold">Preparing your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Restoring your session and routing you to the right dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />;
  }

  return <>{children}</>;
};

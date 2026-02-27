import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

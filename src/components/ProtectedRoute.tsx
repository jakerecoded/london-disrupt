import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - user:', user ? 'authenticated' : 'null', 'loading:', loading);

  useEffect(() => {
    // Check if we have a session in localStorage but user is null
    const checkLocalStorage = async () => {
      try {
        // Force refresh the session
        const { data } = await supabase.auth.getSession();
        console.log('ProtectedRoute - Forced session check:', data.session);
      } catch (error) {
        console.error('ProtectedRoute - Error checking session:', error);
      }
    };
    
    if (!loading && !user) {
      checkLocalStorage();
    }
  }, [loading, user]);

  // If still loading auth state, show nothing or a loading indicator
  if (loading) {
    console.log('ProtectedRoute - Still loading auth state');
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login page
  if (!user) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  console.log('ProtectedRoute - Authenticated, rendering protected content');
  return <>{children}</>;
}

export default ProtectedRoute;

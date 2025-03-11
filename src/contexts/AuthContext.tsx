import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Check if we have hash parameters from a magic link
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
          console.log('AuthContext - Found access_token in URL hash, processing...');
        }
        
        // Check active sessions
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('AuthContext - Initial session check:', session);
        if (error) {
          console.error('AuthContext - Error getting session:', error);
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('AuthContext - Auth state change event:', event);
          console.log('AuthContext - New session:', session);
          
          setUser(session?.user ?? null);
          
          // If user just signed in, refresh the page to ensure all components update
          if (event === 'SIGNED_IN') {
            console.log('AuthContext - User signed in, updating state');
            // Force a page reload to ensure all components update
          }
        });
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('AuthContext - Error in auth setup:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

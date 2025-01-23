import { useState } from 'react';
import AuthDialog from './AuthDialog';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import LocationSearch from './LocationSearch';

function Header() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold">Phone Theft Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && <LocationSearch />} {/* Only show search when logged in */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthDialog(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </header>
  );
}

export default Header;
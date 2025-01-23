import { useState } from 'react';
import AuthDialog from './AuthDialog';

function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Phone Theft Tracker
          </h1>
          <div className="space-x-4">
            <button 
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsAuthOpen(true)}
            >
              Log in
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setIsAuthOpen(true)}
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      <AuthDialog 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}

export default Header;
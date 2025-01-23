import { useRef, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog 
      ref={dialogRef}
      className="rounded-lg p-0 backdrop:bg-black/50"
      onClose={onClose}
    >
      <div className="min-w-[400px]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb', // blue-600 to match our theme
                    brandAccent: '#1d4ed8', // blue-700 for hover
                  },
                },
              },
            }}
            view="magic_link"
            showLinks={false}
            magicLink={true}
            providers={[]}
            redirectTo={"https://studious-train-x59p46rgvg7phpvg9-5173.app.github.dev"}
          />
        </div>
      </div>
    </dialog>
  );
}

export default AuthDialog;
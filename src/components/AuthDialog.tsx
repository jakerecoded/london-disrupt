import { useRef, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import styles from './AuthDialog.module.css';

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
      className={styles.dialog}
      onClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sign in</h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>
        <div className={styles.content}>
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

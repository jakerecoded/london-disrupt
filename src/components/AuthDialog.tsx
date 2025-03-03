import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Modal } from '@mantine/core';
import { supabase } from '../lib/supabase';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  // Notification toast-like styling (copied from PerpetratorInformationDialog)
  const modalStyles = {
    root: {},
    header: { backgroundColor: 'rgba(22,35,46,1)', borderBottom: 'none' },
    title: { color: 'white', fontWeight: 600 },
    body: { backgroundColor: 'rgba(22,35,46,1)', padding: '1rem' },
    close: { color: 'white' },
    overlay: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    content: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Sign in"
      styles={modalStyles}
      size="md"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
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
    </Modal>
  );
}

export default AuthDialog;

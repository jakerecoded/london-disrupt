import { useEffect } from 'react';
import { IconSquareRoundedChevronsUpFilled } from '@tabler/icons-react';
import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import classes from './LoginPage.module.css';

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className={classes.container}>
      <div className={classes.leftSide}>
        <div className={classes.logoContainer}>
          <IconSquareRoundedChevronsUpFilled 
            size={28} 
            style={{ color: "#1c94d8", stroke: "#1c94d8", fill: "#1c94d8" }}
          />
          <Text 
            size="xl" 
            fw={900} 
            variant="gradient" 
            gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
          >
            snatchback.London
          </Text>
        </div>
        
        <h1 className={classes.title}>Log in or sign up using a magic link</h1>
        
        <p className={classes.description}>
          We'll send you a link to your email address that you can use to access the platform, 
          whether this is your first time or your 100th. Just enter your email below and click 
          'Send me my magic link' to proceed.
        </p>
        
        <div className={classes.formContainer}>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1c94d8',
                    brandAccent: '#1a85c3',
                    inputBackground: 'rgba(32,45,56,1)',
                    inputText: 'white',
                    inputBorder: 'rgba(42,55,66,1)',
                    inputBorderFocus: '#1c94d8',
                    inputBorderHover: '#1c94d8',
                  },
                  fonts: {
                    bodyFontFamily: 'inherit',
                    buttonFontFamily: 'inherit',
                    inputFontFamily: 'inherit',
                    labelFontFamily: 'inherit',
                  },
                  space: {
                    inputPadding: '1rem',
                    buttonPadding: '1rem',
                  },
                  borderWidths: {
                    buttonBorderWidth: '0',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.25rem',
                    buttonBorderRadius: '0.25rem',
                    inputBorderRadius: '0.25rem',
                  },
                  fontSizes: {
                    baseBodySize: '1rem',
                    baseInputSize: '1.25rem',
                    baseButtonSize: '1rem',
                  },
                },
              },
            }}
            view="magic_link"
            showLinks={false}
            magicLink={true}
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>
      </div>
      
      <div className={classes.rightSide}>
        <img src="/LondonImage.jpg" alt="London cityscape" />
      </div>
    </div>
  );
}

export default LoginPage;

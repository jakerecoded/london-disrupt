import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function MagicLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMagicLink = async () => {
      console.log('MagicLinkHandler - URL:', window.location.href);
      
      // Extract tokens from the URL hash
      const fullUrl = window.location.href;
      
      // Check if we have access_token in the URL
      if (fullUrl.includes('access_token=')) {
        console.log('MagicLinkHandler - Found access_token in URL');
        
        try {
          // Extract the part after "#access_token="
          const hashPart = fullUrl.split('#access_token=')[1];
          
          if (hashPart) {
            // Create a proper query string format for parsing
            const queryString = 'access_token=' + hashPart;
            const urlParams = new URLSearchParams(queryString);
            
            const accessToken = urlParams.get('access_token');
            // Get refresh token - may be after "&refresh_token="
            let refreshToken = null;
            
            if (hashPart.includes('refresh_token=')) {
              const refreshPart = hashPart.split('refresh_token=')[1].split('&')[0];
              refreshToken = refreshPart;
            }
            
            console.log('MagicLinkHandler - Extracted tokens:', { 
              accessToken: accessToken ? 'found' : 'missing',
              refreshToken: refreshToken ? 'found' : 'missing'
            });
            
            if (accessToken && refreshToken) {
              // Manually set the session with extracted tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (error) {
                console.error('MagicLinkHandler - Error setting session:', error);
              } else {
                console.log('MagicLinkHandler - Session set successfully:', data.session ? 'valid' : 'invalid');
                
                // Add extra verification
                const { data: sessionData } = await supabase.auth.getSession();
                console.log('MagicLinkHandler - Verified session:', sessionData.session ? 'exists' : 'missing');
                
                // Navigate to home page
                navigate('/', { replace: true });
              }
            } else {
              console.error('MagicLinkHandler - Missing tokens in URL');
            }
          }
        } catch (error) {
          console.error('MagicLinkHandler - Error processing tokens:', error);
        }
      } else {
        console.log('MagicLinkHandler - No tokens found in URL');
      }
    };
    
    handleMagicLink();
  }, [navigate]);
  
  return <div>Processing authentication...</div>;
}

export default MagicLinkHandler;
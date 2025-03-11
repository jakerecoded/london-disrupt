import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function MagicLinkHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleMagicLink = async () => {
      console.log('MagicLinkHandler - URL:', window.location.href);
      
      try {
        // First attempt: Let Supabase automatically handle the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('MagicLinkHandler - Error getting session:', error);
        } else if (data.session) {
          // Success! Authenticated session found
          console.log('MagicLinkHandler - Session found:', data.session.user.email);
          navigate('/', { replace: true });
          return;
        } 
        
        // Second attempt: Look for tokens in URL (either hash or query parameters)
        console.log('MagicLinkHandler - No automatic session, checking URL params');
        
        // Check query parameters first (BrowserRouter typically uses these)
        const urlParams = new URLSearchParams(window.location.search);
        let accessToken = urlParams.get('access_token');
        let refreshToken = urlParams.get('refresh_token');
        
        // If not in query params, check hash (fallback for redirects that use hash)
        if (!accessToken && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1) // Remove the leading #
          );
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          
          // Additional fallback for complex hash patterns (#/path#token=...)
          if (!accessToken && window.location.hash.includes('access_token=')) {
            const hashPart = window.location.hash.split('access_token=')[1];
            if (hashPart) {
              const paramStr = 'access_token=' + hashPart;
              const hashUrlParams = new URLSearchParams(paramStr);
              accessToken = hashUrlParams.get('access_token');
              
              if (hashPart.includes('refresh_token=')) {
                const refreshPart = hashPart.split('refresh_token=')[1].split('&')[0];
                refreshToken = refreshPart;
              }
            }
          }
        }
        
        // If we found tokens, set the session manually
        if (accessToken && refreshToken) {
          console.log('MagicLinkHandler - Found tokens in URL');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('MagicLinkHandler - Error setting session:', error);
          } else {
            console.log('MagicLinkHandler - Session set successfully:', 
                        data.session ? 'valid' : 'invalid');
            navigate('/', { replace: true });
          }
        } else {
          console.log('MagicLinkHandler - No tokens found in URL');
        }
      } catch (error) {
        console.error('MagicLinkHandler - Error processing auth:', error);
      }
    };
    
    handleMagicLink();
  }, [navigate]);
  
  return <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="text-xl font-semibold mb-2">Processing authentication...</div>
      <div className="text-gray-500">You will be redirected shortly.</div>
    </div>
  </div>;
}

export default MagicLinkHandler;
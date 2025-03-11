import { AuthProvider } from './contexts/AuthContext';
import { IncidentProvider } from './contexts/IncidentContext';
import Header from './components/Header';
import Map from './components/Map';
import Analytics from './components/Analytics';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Changed from HashRouter to BrowserRouter
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import MagicLinkHandler from './components/MagicLinkHandler';

// Create a custom theme with notification styling
const theme = createTheme({
  components: {
    Notification: {
      styles: {
        root: {
          backgroundColor: 'rgba(22,35,46,1)',
          borderColor: 'rgba(22,35,46,1)',
        },
        body: {
          color: 'white',
        },
        title: {
          color: 'white',
        },
      },
    },
  },
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="bottom-right" />
      <BrowserRouter basename="/"> {/* Changed from HashRouter to BrowserRouter */}
        <AuthProvider>
          <IncidentProvider>
            <div className="h-screen flex flex-col">
              <Header />
              <main className="flex-1 relative">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route 
                    path="/home" 
                    element={<ProtectedRoute><Map /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/" 
                    element={<Navigate to="/home" replace />} 
                  />
                  <Route 
                    path="/analytics" 
                    element={<ProtectedRoute><Analytics /></ProtectedRoute>} 
                  />
                  <Route path="/auth/callback" element={<MagicLinkHandler />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </main>
            </div>
          </IncidentProvider>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;

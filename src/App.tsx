import { AuthProvider } from './contexts/AuthContext';
import { IncidentProvider } from './contexts/IncidentContext';
import Header from './components/Header';
import Map from './components/Map';
import Analytics from './components/Analytics';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mapbox-gl/dist/mapbox-gl.css';

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
      <AuthProvider>
        <IncidentProvider>
          <HashRouter>
            <div className="h-screen flex flex-col">
              <Header />
              <main className="flex-1 relative">
                <Routes>
                  <Route path="/" element={<Map />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </div>
          </HashRouter>
        </IncidentProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

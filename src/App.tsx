import { AuthProvider } from './contexts/AuthContext';
import { IncidentProvider } from './contexts/IncidentContext';
import Header from './components/Header';
import Map from './components/Map';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  return (
    <MantineProvider>
      <Notifications position="bottom-right" />
      <AuthProvider>
        <IncidentProvider>
          <div className="h-screen flex flex-col">
            <Header />
            <main className="flex-1 relative">
              <Map />
            </main>
          </div>
        </IncidentProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

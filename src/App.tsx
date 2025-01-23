import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Map from './components/Map';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
    <AuthProvider>
      <div className="h-screen flex flex-col">
        <Header />
        <main className="flex-1 relative">
          <Map />
        </main>
      </div>
    </AuthProvider>
    </MantineProvider>
  );
}

export default App;
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Map from './components/Map';
import { MantineProvider } from '@mantine/core';

function App() {
  return (
    <MantineProvider>
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Map />
        </main>
      </div>
    </AuthProvider>
    </MantineProvider>
  );
}

export default App;
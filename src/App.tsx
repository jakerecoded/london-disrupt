import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Map from './components/Map';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Map />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
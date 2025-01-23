import Header from './components/Header';
import Map from './components/Map';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Map />
      </main>
    </div>
  );
}

export default App;
import Map from './components/Map';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Phone Theft Tracker
        </h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';

interface StopLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    timestamp: string;
    duration: string;
    location: { longitude: number; latitude: number };
  }) => void;
  location: { longitude: number; latitude: number };
}

const StopLocationDialog = ({ isOpen, onClose, onSubmit, location }: StopLocationDialogProps) => {
  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    hours: '0',
    minutes: '0',
    location: {
      latitude: location.latitude,
      longitude: location.longitude
    }
  });

  // Update formData location when location prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }));
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format duration as PostgreSQL interval string
    const duration = `${formData.hours} hours ${formData.minutes} minutes`;
    
    onSubmit({
      timestamp: formData.timestamp,
      duration,
      location: formData.location
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Phone Stop Location Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">When did the phone arrive here?</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.timestamp}
                onChange={e => setFormData({...formData, timestamp: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How long did the phone stay here?</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500">Hours</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={formData.hours}
                    onChange={e => setFormData({...formData, hours: e.target.value})}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={formData.minutes}
                    onChange={e => setFormData({...formData, minutes: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StopLocationDialog;

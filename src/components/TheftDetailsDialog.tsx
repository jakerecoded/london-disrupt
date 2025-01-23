import { useState } from 'react';

interface TheftLocation {
  id: string;
  longitude: number;
  latitude: number;
  date: string;
  bikeDescription: string;
  theftDescription?: string;
  lockType?: string;
  policeCaseNumber?: string;
}

interface TheftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: Partial<TheftLocation>) => void;
  location: {longitude: number; latitude: number};
}

const TheftDetailsDialog = ({ isOpen, onClose, onSubmit, location }: TheftDetailsDialogProps) => {
  const [formData, setFormData] = useState({
    date: '',
    bikeDescription: '',
    theftDescription: '',
    lockType: '',
    policeCaseNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      longitude: location.longitude,
      latitude: location.latitude
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Report Bike Theft Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Theft</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Bike Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.bikeDescription}
                onChange={e => setFormData({...formData, bikeDescription: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Theft Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.theftDescription}
                onChange={e => setFormData({...formData, theftDescription: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lock Type</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.lockType}
                onChange={e => setFormData({...formData, lockType: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Police Case Number</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.policeCaseNumber}
                onChange={e => setFormData({...formData, policeCaseNumber: e.target.value})}
              />
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

export default TheftDetailsDialog;

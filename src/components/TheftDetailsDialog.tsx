import { useState } from 'react';
import { TheftDetails } from '../types/theft';

interface TheftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: TheftDetails) => void;  // Removed Partial since we'll collect all fields
  location: {longitude: number; latitude: number};
}

const TheftDetailsDialog = ({ isOpen, onClose, onSubmit, location }: TheftDetailsDialogProps) => {
  const [formData, setFormData] = useState<TheftDetails>({
    timeOfTheft: '',
    phoneDetails: '',
    victimDetails: '',
    reportedToPolice: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className={`fixed inset-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Give us some more details about the incident</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">When was the phone stolen?</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.timeOfTheft}
                onChange={e => setFormData({...formData, timeOfTheft: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Details</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.phoneDetails}
                onChange={e => setFormData({...formData, phoneDetails: e.target.value})}
                placeholder="Make, model, color, distinguishing features..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Details</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.victimDetails}
                onChange={e => setFormData({...formData, victimDetails: e.target.value})}
                placeholder="Any relevant details about yourself that might help identify the incident..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Have you reported this to the police?</label>
              <div className="mt-1">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm mr-2"
                  checked={formData.reportedToPolice}
                  onChange={e => setFormData({...formData, reportedToPolice: e.target.checked})}
                />
                <span className="text-sm text-gray-500">Yes, I have reported this to the police</span>
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

export default TheftDetailsDialog;

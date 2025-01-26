interface FinalLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { timestamp: string; location: { longitude: number; latitude: number } }) => void;
  location: { longitude: number; latitude: number };
}

function FinalLocationDialog({ isOpen, onClose, onSubmit, location }: FinalLocationDialogProps) {
  const handleConfirm = () => {
    onSubmit({
      timestamp: new Date().toISOString(),
      location
    });
  };

  return (
    <div className={`fixed inset-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Confirm Final Location</h2>
          <p className="mb-6">
            Are you sure this is the location where your phone stopped sharing its location? 
            After adding this point you won't be able to add any more for this incident.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Yes, Add Final Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalLocationDialog;

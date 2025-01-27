import { Dialog } from '@headlessui/react';
import { TimelineMarker } from '../types/theft';

interface DeleteMarkerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  marker: TimelineMarker | null;
}

function DeleteMarkerDialog({ isOpen, onClose, onConfirm, marker }: DeleteMarkerDialogProps) {
  if (!marker) return null;

  const getMarkerTypeDisplay = () => {
    switch (marker.type) {
      case 'THEFT':
        return 'initial theft location';
      case 'HOLDING':
        return 'stop location';
      case 'FINAL':
        return 'final location';
      case 'PATH':
        return 'path point';
      default:
        return 'location';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto">
          <Dialog.Title className="text-lg font-medium mb-4">
            Delete {getMarkerTypeDisplay()}
          </Dialog.Title>

          <p className="mb-6">
            Are you sure you want to delete this {getMarkerTypeDisplay()}?
            {marker.type === 'PATH' && ' The path will be redrawn to connect the remaining points.'}
          </p>

          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default DeleteMarkerDialog;

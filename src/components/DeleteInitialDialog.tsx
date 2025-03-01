import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface DeleteInitialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteInitialDialog({ isOpen, onClose, onConfirm }: DeleteInitialDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center mb-4 text-red-500">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mr-2" />
            <Dialog.Title className="text-lg font-bold">Delete Initial Theft Location</Dialog.Title>
          </div>

          <Dialog.Description className="mb-6 text-gray-600">
            Warning: Deleting the initial theft location will remove all associated paths and markers. 
            You will need to start from scratch. This action cannot be undone.
          </Dialog.Description>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default DeleteInitialDialog;

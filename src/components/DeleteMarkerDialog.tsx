import { Dialog } from '@headlessui/react';
import { TimelineMarker } from '../types/theft';
import styles from './DeleteMarkerDialog.module.css';

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
      className={styles.dialogContainer}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.overlay} />

        <div className={styles.dialogPanel}>
          <Dialog.Title className={styles.dialogTitle}>
            Delete {getMarkerTypeDisplay()}
          </Dialog.Title>

          <p className={styles.dialogDescription}>
            Are you sure you want to delete this {getMarkerTypeDisplay()}?
            {marker.type === 'PATH' && ' The path will be redrawn to connect the remaining points.'}
          </p>

          <div className={styles.buttonContainer}>
            <button
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={styles.confirmButton}
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

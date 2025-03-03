import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from './DeleteInitialDialog.module.css';

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
      className={styles.dialogContainer}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.overlay} />
        
        <div className={styles.dialogPanel}>
          <div className={styles.headerContainer}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
            <Dialog.Title className={styles.dialogTitle}>Delete Initial Theft Location</Dialog.Title>
          </div>

          <Dialog.Description className={styles.dialogDescription}>
            Warning: Deleting the initial theft location will remove all associated paths and markers. 
            You will need to start from scratch. This action cannot be undone.
          </Dialog.Description>

          <div className={styles.buttonContainer}>
            <button
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={styles.confirmButton}
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

import styles from './NewIncidentDialog.module.css';

interface NewIncidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function NewIncidentDialog({ isOpen, onClose, onConfirm }: NewIncidentDialogProps) {
  return (
    <div className={`${styles.dialogOverlay} ${isOpen ? styles.visible : styles.hidden}`}>
      <div className={styles.dialogBackdrop} onClick={onClose} />
      <div className={styles.dialogContainer}>
        <h2 className={styles.dialogTitle}>Start a new incident timeline</h2>
        <p className={styles.dialogText}>
          Are you sure you want to start a new incident timeline? Your existing incident will still be saved and you can switch back to it at any time using the drop down in the navigation bar.
        </p>
        <div className={styles.buttonContainer}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            New incident
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewIncidentDialog;

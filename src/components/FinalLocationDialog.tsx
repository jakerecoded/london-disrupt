import styles from './FinalLocationDialog.module.css';

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
    <div className={`${styles.dialogContainer} ${isOpen ? styles.visible : styles.hidden}`}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialogPanel}>
        <div className={styles.contentWrapper}>
          <h2 className={styles.dialogTitle}>Confirm Final Location</h2>
          <p className={styles.dialogDescription}>
            Are you sure this is the location where your phone stopped sharing its location? 
            After adding this point you won't be able to add any more for this incident.
          </p>
          <div className={styles.buttonContainer}>
            <button
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={styles.confirmButton}
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

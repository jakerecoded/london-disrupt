import { useState, useEffect } from 'react';
import styles from './PerpetratorInformationDialog.module.css';

interface PerpetratorInformationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (info: {
    vehicleInformation: string;
    clothingInformation: string;
    groupInformation: string;
    otherInformation: string;
  }) => void;
  initialData?: {
    vehicleInformation: string;
    clothingInformation: string;
    groupInformation: string;
    otherInformation: string;
  };
}

function PerpetratorInformationDialog({
  isOpen,
  onClose,
  onSave,
  initialData
}: PerpetratorInformationDialogProps) {
  const [formData, setFormData] = useState({
    vehicleInformation: '',
    clothingInformation: '',
    groupInformation: '',
    otherInformation: ''
  });

  // Load initial data when provided or when dialog opens
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={`${styles.dialogOverlay} ${isOpen ? styles.visible : styles.hidden}`}>
      <div className={styles.dialogBackdrop} onClick={onClose} />
      <div className={styles.dialogContainer}>
        <h2 className={styles.dialogTitle}>Add some information about who attacked you</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Can you describe the vehicles they were using?</label>
            <textarea
              className={styles.textArea}
              value={formData.vehicleInformation}
              onChange={(e) => setFormData({...formData, vehicleInformation: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Can you describe what they were wearing?</label>
            <textarea
              className={styles.textArea}
              value={formData.clothingInformation}
              onChange={(e) => setFormData({...formData, clothingInformation: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Can you describe any other things about their wider group?</label>
            <textarea
              className={styles.textArea}
              value={formData.groupInformation}
              onChange={(e) => setFormData({...formData, groupInformation: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Do you have any other information about your attackers?</label>
            <textarea
              className={styles.textArea}
              value={formData.otherInformation}
              onChange={(e) => setFormData({...formData, otherInformation: e.target.value})}
            />
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PerpetratorInformationDialog;

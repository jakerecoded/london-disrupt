import { useState, useEffect } from 'react';
import { InitialTheftReport } from '../types/theft';
import styles from './TheftDetailsDialog.module.css';

interface TheftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: InitialTheftReport) => void;
  location: {longitude: number; latitude: number};
}

const TheftDetailsDialog = ({ isOpen, onClose, onSubmit, location }: TheftDetailsDialogProps) => {
  const [formData, setFormData] = useState<InitialTheftReport>({
    timeOfTheft: '',
    phoneDetails: '',
    victimDetails: '',
    reportedToPolice: false,
    location: {
      latitude: location.latitude,
      longitude: location.longitude
    }
  });

  // Update formData location when location prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }));
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  // Rest of the component remains the same
  return (
    <div className={`${styles.dialogContainer} ${isOpen ? styles.visible : styles.hidden}`}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialogPanel}>
        <h2 className={styles.dialogTitle}>Give us some more details about the incident</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div>
              <label className={styles.label}>When was the phone stolen?</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={formData.timeOfTheft}
                onChange={e => setFormData({...formData, timeOfTheft: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className={styles.label}>Phone Details</label>
              <textarea
                className={styles.input}
                value={formData.phoneDetails}
                onChange={e => setFormData({...formData, phoneDetails: e.target.value})}
                placeholder="Make, model, color, distinguishing features..."
                required
              />
            </div>

            <div>
              <label className={styles.label}>Your Details</label>
              <textarea
                className={styles.input}
                value={formData.victimDetails}
                onChange={e => setFormData({...formData, victimDetails: e.target.value})}
                placeholder="Any relevant details about yourself that might help identify the incident..."
                required
              />
            </div>

            <div>
              <label className={styles.label}>Have you reported this to the police?</label>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.reportedToPolice}
                  onChange={e => setFormData({...formData, reportedToPolice: e.target.checked})}
                />
                <span className={styles.checkboxLabel}>Yes, I have reported this to the police</span>
              </div>
            </div>
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
              className={styles.submitButton}
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

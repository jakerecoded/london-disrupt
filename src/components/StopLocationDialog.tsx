import { useState, useEffect } from 'react';
import styles from './StopLocationDialog.module.css';

interface StopLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    timestamp: string;
    duration: string;
    location: { longitude: number; latitude: number };
  }) => void;
  location: { longitude: number; latitude: number };
}

const StopLocationDialog = ({ isOpen, onClose, onSubmit, location }: StopLocationDialogProps) => {
  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    hours: '0',
    minutes: '0',
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
    
    // Format duration as PostgreSQL interval string
    const duration = `${formData.hours} hours ${formData.minutes} minutes`;
    
    onSubmit({
      timestamp: formData.timestamp,
      duration,
      location: formData.location
    });
    onClose();
  };

  return (
    <div className={`${styles.dialogContainer} ${isOpen ? styles.visible : styles.hidden}`}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialogPanel}>
        <h2 className={styles.dialogTitle}>Phone Stop Location Details</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <div>
              <label className={styles.label}>When did the phone arrive here?</label>
              <input
                type="datetime-local"
                className={styles.input}
                value={formData.timestamp}
                onChange={e => setFormData({...formData, timestamp: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className={styles.label}>How long did the phone stay here?</label>
              <div className={styles.durationContainer}>
                <div className={styles.durationField}>
                  <label className={styles.secondaryLabel}>Hours</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    value={formData.hours}
                    onChange={e => setFormData({...formData, hours: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.durationField}>
                  <label className={styles.secondaryLabel}>Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className={styles.input}
                    value={formData.minutes}
                    onChange={e => setFormData({...formData, minutes: e.target.value})}
                    required
                  />
                </div>
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

export default StopLocationDialog;

import { useState, useEffect } from 'react';
import { InitialTheftReport } from '../types/theft';
import { Modal, Button, TextInput, Textarea, Checkbox, Group, Stack } from '@mantine/core';

interface TheftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: InitialTheftReport) => void;
  location: {longitude: number; latitude: number};
}

function TheftDetailsDialog({ isOpen, onClose, onSubmit, location }: TheftDetailsDialogProps) {
  // Add global style for calendar icon
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        filter: invert(1) !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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

  // Notification toast-like styling
  const modalStyles = {
    root: {},
    header: { backgroundColor: 'rgba(22,35,46,1)', borderBottom: 'none' },
    title: { color: 'white', fontWeight: 600 },
    body: { backgroundColor: 'rgba(22,35,46,1)', padding: '1rem' },
    close: { color: 'white' },
    overlay: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    content: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }
  };

  // Slightly lighter background for input fields
  const inputStyles = {
    input: {
      backgroundColor: 'rgba(32,45,56,1)',
      color: 'white',
      border: '1px solid rgba(42,55,66,1)',
      '&:focus': {
        borderColor: '#1c94d8'
      },
      '&[type="datetime-local"]': {
        colorScheme: 'dark', // Additional property to help with dark mode styling
        '&::-webkit-calendar-picker-indicator': {
          filter: 'invert(1) brightness(200%) !important', // Makes the calendar icon white with increased brightness
          cursor: 'pointer'
        }
      },
      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button, &::-webkit-clear-button': {
        filter: 'invert(1) brightness(100%) !important'
      },
      '&::-ms-clear, &::-ms-reveal': {
        filter: 'invert(1) brightness(100%) !important'
      }
    },
    label: {
      color: 'white',
      fontWeight: 500,
      marginBottom: '0.5rem'
    },
    icon: {
      color: 'white' // Make input icons white
    },
    control: {
      color: 'white', // Make up/down arrows white
      borderColor: 'rgba(42,55,66,1)' // Remove white separator by matching border color
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Give us some more details about the incident"
      styles={modalStyles}
      size="lg"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            type="datetime-local"
            label="When was the phone stolen?"
            value={formData.timeOfTheft}
            onChange={(e) => setFormData({...formData, timeOfTheft: e.target.value})}
            styles={{
              ...inputStyles,
              input: {
                ...inputStyles.input,
                '&::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1) !important',
                  opacity: '1',
                  cursor: 'pointer'
                }
              }
            }}
            required
          />
          
          <Textarea
            label="Phone Details"
            value={formData.phoneDetails}
            onChange={(e) => setFormData({...formData, phoneDetails: e.target.value})}
            placeholder="Make, model, color, distinguishing features..."
            styles={inputStyles}
            required
          />

          <Textarea
            label="Your Details"
            value={formData.victimDetails}
            onChange={(e) => setFormData({...formData, victimDetails: e.target.value})}
            placeholder="Any relevant details about yourself that might help identify the incident..."
            styles={inputStyles}
            required
          />

          <Checkbox
            label="Yes, I have reported this to the police"
            checked={formData.reportedToPolice}
            onChange={(e) => setFormData({...formData, reportedToPolice: e.target.checked})}
            styles={{
              ...inputStyles,
              label: {
                ...inputStyles.label,
                marginBottom: 0
              }
            }}
          />
          
          <Group justify="space-between" mt="xl">
            <Button
              variant="filled"
              color="red"
              onClick={onClose}
              styles={{
                root: {
                  backgroundColor: '#ef4444',
                  '&:hover': { backgroundColor: '#dc2626' }
                },
                label: { color: 'white' }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              type="submit"
              styles={{
                root: {
                  backgroundColor: '#1c94d8',
                  '&:hover': { backgroundColor: '#1a85c3' }
                },
                label: { color: 'white' }
              }}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default TheftDetailsDialog;

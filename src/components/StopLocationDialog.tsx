import { useState, useEffect } from 'react';
import { Modal, Button, TextInput, NumberInput, Group, Stack } from '@mantine/core';

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

function StopLocationDialog({ isOpen, onClose, onSubmit, location }: StopLocationDialogProps) {
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
      title="Phone Stop Location Details"
      styles={modalStyles}
      size="lg"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            type="datetime-local"
            label="When did the phone arrive here?"
            value={formData.timestamp}
            onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
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
          
          <Stack gap="xs">
            <div style={{ color: 'white', fontWeight: 500 }}>How long did the phone stay here?</div>
            <Group grow>
              <NumberInput
                label="Hours"
                value={formData.hours}
                onChange={(val) => setFormData({...formData, hours: val?.toString() || '0'})}
                min={0}
                styles={inputStyles}
                required
              />
              <NumberInput
                label="Minutes"
                value={formData.minutes}
                onChange={(val) => setFormData({...formData, minutes: val?.toString() || '0'})}
                min={0}
                max={59}
                styles={inputStyles}
                required
              />
            </Group>
          </Stack>
          
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

export default StopLocationDialog;

import { useState, useEffect } from 'react';
import { Modal, Button, Textarea, Group, Stack } from '@mantine/core';

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
  const textareaStyles = {
    input: {
      backgroundColor: 'rgba(32,45,56,1)',
      color: 'white',
      border: '1px solid rgba(42,55,66,1)',
      '&:focus': {
        borderColor: '#1c94d8'
      }
    },
    label: {
      color: 'white',
      fontWeight: 500,
      marginBottom: '0.5rem'
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Add some information about who attacked you"
      styles={modalStyles}
      size="lg"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Textarea
            label="Can you describe the vehicles they were using?"
            value={formData.vehicleInformation}
            onChange={(e) => setFormData({...formData, vehicleInformation: e.target.value})}
            minRows={3}
            styles={textareaStyles}
          />
          
          <Textarea
            label="Can you describe what they were wearing?"
            value={formData.clothingInformation}
            onChange={(e) => setFormData({...formData, clothingInformation: e.target.value})}
            minRows={3}
            styles={textareaStyles}
          />
          
          <Textarea
            label="Can you describe any other things about their wider group?"
            value={formData.groupInformation}
            onChange={(e) => setFormData({...formData, groupInformation: e.target.value})}
            minRows={3}
            styles={textareaStyles}
          />
          
          <Textarea
            label="Do you have any other information about your attackers?"
            value={formData.otherInformation}
            onChange={(e) => setFormData({...formData, otherInformation: e.target.value})}
            minRows={3}
            styles={textareaStyles}
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
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default PerpetratorInformationDialog;

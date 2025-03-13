import { Modal, Button, Group, Text } from '@mantine/core';

interface NewIncidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function NewIncidentDialog({ isOpen, onClose, onConfirm }: NewIncidentDialogProps) {
  // Notification toast-like styling - same as PerpetratorInformationDialog
  const modalStyles = {
    root: {},
    header: { backgroundColor: 'rgba(22,35,46,1)', borderBottom: 'none' },
    title: { color: 'white', fontWeight: 600 },
    body: { backgroundColor: 'rgba(22,35,46,1)', padding: '1rem' },
    close: { color: 'white' },
    overlay: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    content: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Start a new incident timeline"
      styles={modalStyles}
      size="md"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      <Text color="white" mb="xl">
        Are you sure you want to start a new incident timeline? Your existing incident will still be saved and you can switch back to it at any time using the drop down in the navigation bar.
      </Text>
      
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
          onClick={onConfirm}
          styles={{
            root: {
              backgroundColor: '#1c94d8',
              '&:hover': { backgroundColor: '#1a85c3' }
            },
            label: { color: 'white' }
          }}
        >
          New incident
        </Button>
      </Group>
    </Modal>
  );
}

export default NewIncidentDialog;

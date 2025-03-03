import { Modal, Button, Group, Stack, Text } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface DeleteInitialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteInitialDialog({ isOpen, onClose, onConfirm }: DeleteInitialDialogProps) {
  // Notification toast-like styling - same as PerpetratorInformationDialog
  const modalStyles = {
    root: {},
    header: { backgroundColor: 'rgba(22,35,46,1)', borderBottom: 'none' },
    title: { color: '#ef4444', fontWeight: 600 },
    body: { backgroundColor: 'rgba(22,35,46,1)', padding: '1rem' },
    close: { color: 'white' },
    overlay: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    content: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }
  };

  // Custom title with icon
  const customTitle = (
    <Group gap="sm" align="center">
      <FontAwesomeIcon icon={faExclamationTriangle} color="#ef4444" />
      <Text color="#ef4444" fw={600}>Delete Initial Theft Location</Text>
    </Group>
  );

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={customTitle}
      styles={modalStyles}
      size="md"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      <Stack gap="md">
        <Text color="white">
          Warning: Deleting the initial theft location will remove all associated paths and markers. 
          You will need to start from scratch. This action cannot be undone.
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
            Continue
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default DeleteInitialDialog;

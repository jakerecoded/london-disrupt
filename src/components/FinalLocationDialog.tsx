import { Modal, Button, Group, Stack } from '@mantine/core';

interface FinalLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { timestamp: string; location: { longitude: number; latitude: number } }) => void;
  location?: { longitude: number; latitude: number };
}

function FinalLocationDialog({ isOpen, onClose, onSubmit, location }: FinalLocationDialogProps) {
  const handleConfirm = () => {
    if (location) {
      onSubmit({
        timestamp: new Date().toISOString(),
        location
      });
    }
  };

  // Notification toast-like styling (copied from PerpetratorInformationDialog)
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
      title="Confirm Final Location"
      styles={modalStyles}
      size="md"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      <Stack gap="md">
        <p style={{ color: 'white' }}>
          Are you sure this is the location where your phone stopped sharing its location? 
          After adding this point you won't be able to add any more for this incident.
        </p>
        
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
            onClick={handleConfirm}
            styles={{
              root: {
                backgroundColor: '#1c94d8',
                '&:hover': { backgroundColor: '#1a85c3' }
              },
              label: { color: 'white' }
            }}
          >
            Yes, Add Final Location
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default FinalLocationDialog;

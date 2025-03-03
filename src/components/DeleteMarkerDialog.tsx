import { Modal, Button, Group, Text } from '@mantine/core';
import { TimelineMarker } from '../types/theft';

interface DeleteMarkerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  marker: TimelineMarker | null;
}

function DeleteMarkerDialog({ isOpen, onClose, onConfirm, marker }: DeleteMarkerDialogProps) {
  const getMarkerTypeDisplay = () => {
    if (!marker) return 'location';
    
    switch (marker.type) {
      case 'THEFT':
        return 'initial theft location';
      case 'HOLDING':
        return 'stop location';
      case 'FINAL':
        return 'final location';
      case 'PATH':
        return 'path point';
      default:
        return 'location';
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
      opened={isOpen && marker !== null}
      onClose={onClose}
      title={`Delete ${getMarkerTypeDisplay()}`}
      styles={modalStyles}
      size="md"
      centered
      transitionProps={{ transition: 'fade', duration: 300 }}
    >
      {marker && (
        <>
          <Text color="white" mb="xl">
            Are you sure you want to delete this {getMarkerTypeDisplay()}?
            {marker.type === 'PATH' && ' The path will be redrawn to connect the remaining points.'}
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
              Delete
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}

export default DeleteMarkerDialog;

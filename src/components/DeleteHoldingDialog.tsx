import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import styles from './DeleteHoldingDialog.module.css';

interface DeleteHoldingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteHoldingDialog({ isOpen, onClose, onConfirm }: DeleteHoldingDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.dialogContainer} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter={styles.enter}
          enterFrom={styles.enterFrom}
          enterTo={styles.enterTo}
          leave={styles.leave}
          leaveFrom={styles.leaveFrom}
          leaveTo={styles.leaveTo}
        >
          <div className={styles.overlay} />
        </Transition.Child>

        <div className={styles.dialogWrapper}>
          <div className={styles.dialogContent}>
            <Transition.Child
              as={Fragment}
              enter={styles.panelEnter}
              enterFrom={styles.panelEnterFrom}
              enterTo={styles.panelEnterTo}
              leave={styles.panelLeave}
              leaveFrom={styles.panelLeaveFrom}
              leaveTo={styles.panelLeaveTo}
            >
              <Dialog.Panel className={styles.dialogPanel}>
                <Dialog.Title
                  as="h3"
                  className={styles.dialogTitle}
                >
                  Delete Holding Location
                </Dialog.Title>
                <div className={styles.descriptionContainer}>
                  <p className={styles.descriptionText}>
                    Are you sure you want to delete this holding location?
                  </p>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={onConfirm}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default DeleteHoldingDialog;

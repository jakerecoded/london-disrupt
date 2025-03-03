import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import styles from './DeleteFinalDialog.module.css';

interface DeleteFinalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteFinalDialog({ isOpen, onClose, onConfirm }: DeleteFinalDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.dialog} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter={styles.enter}
          enterFrom={styles.enterFrom}
          enterTo={styles.enterTo}
          leave={styles.leave}
          leaveFrom={styles.leaveFrom}
          leaveTo={styles.leaveTo}
        >
          <div className={styles.backdrop} />
        </Transition.Child>

        <div className={styles.container}>
          <div className={styles.innerContainer}>
            <Transition.Child
              as={Fragment}
              enter={styles.panelEnter}
              enterFrom={styles.panelEnterFrom}
              enterTo={styles.panelEnterTo}
              leave={styles.panelLeave}
              leaveFrom={styles.panelLeaveFrom}
              leaveTo={styles.panelLeaveTo}
            >
              <Dialog.Panel className={styles.panel}>
                <Dialog.Title
                  as="h3"
                  className={styles.title}
                >
                  Delete Final Location
                </Dialog.Title>
                <div>
                  <p className={styles.text}>
                    Are you sure you want to delete this final location?
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

export default DeleteFinalDialog;

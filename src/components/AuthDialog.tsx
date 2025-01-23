import { useRef, useEffect } from 'react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog 
      ref={dialogRef}
      className={`
        rounded-lg p-0 backdrop:bg-black/50
        backdrop:transition-opacity backdrop:duration-300
        backdrop:opacity-0 [&[open]]:backdrop:opacity-100
        
        scale-95 opacity-0 transition-all duration-300
        [&[open]]:scale-100 [&[open]]:opacity-100
      `}
      onClose={onClose}
    >
      <div className="min-w-[400px]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Sign up</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Authentication options will go here</p>
        </div>
      </div>
    </dialog>
  );
}

export default AuthDialog;
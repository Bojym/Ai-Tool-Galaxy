import React, { ReactNode, useEffect, MouseEvent } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    // Cleanup function to restore original overflow style
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);


  if (!isOpen) return null;

  const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    // Updated 'full' size to be truly full-screen
    full: 'w-screen h-screen max-w-none max-h-none rounded-none shadow-none'
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const handleModalContentClick = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to backdrop
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-[#222]/70 transition-opacity duration-300 ease-in-out"
        onClick={handleBackdropClick} // Click outside to close
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        style={{ top: 0, left: 0 }}
    >
      <div 
        className={`
          bg-white p-6
          ${size === 'full' ? '' : 'rounded-lg shadow-xl'}
          ${sizeClasses[size]} 
          max-h-[90vh] min-h-0 overflow-y-auto
          transform transition-all duration-500 ease-in-out scale-90 opacity-0 animate-modalEnterSmooth relative
        `}
        onClick={handleModalContentClick} // Stop propagation for clicks inside modal
        style={{ boxSizing: 'border-box', margin: 0 }}
      >
        {(title || !title) && ( // Always show close button, adjust layout if title exists
          <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
            {title && <h2 id="modal-title" className="text-xl font-semibold text-[#0F172A]">{title}</h2>}
            <button
              onClick={onClose} // X button close
              className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${title ? '' : 'absolute top-3 right-3'}`}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-500 hover:text-slate-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="text-[#0F172A]">{children}</div>
      </div>
      <style>{`
        @keyframes modalEnterSmooth {
          0% { transform: scale(0.85) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0px); opacity: 1; }
        }
        .animate-modalEnterSmooth { animation: modalEnterSmooth 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Modal;

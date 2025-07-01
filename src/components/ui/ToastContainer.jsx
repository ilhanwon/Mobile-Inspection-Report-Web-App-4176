import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast, position = 'top-right' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={0} // 이미 useToast에서 관리됨
              onClose={() => removeToast(toast.id)}
              position={position}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ToastContainer);
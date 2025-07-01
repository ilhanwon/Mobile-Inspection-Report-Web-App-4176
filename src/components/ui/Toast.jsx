import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiAlertTriangle, FiInfo, FiX, FiAlertCircle } = FiIcons;

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right' 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      icon: FiCheck,
      bgColor: 'bg-green-500',
      textColor: 'text-green-50',
      borderColor: 'border-green-400'
    },
    error: {
      icon: FiAlertCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-red-50',
      borderColor: 'border-red-400'
    },
    warning: {
      icon: FiAlertTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-50',
      borderColor: 'border-yellow-400'
    },
    info: {
      icon: FiInfo,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-50',
      borderColor: 'border-blue-400'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const config = types[type];

  return (
    <motion.div
      className={`
        fixed ${positions[position]} z-50 max-w-sm w-full mx-4
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border rounded-xl shadow-lg p-4 flex items-center space-x-3
      `}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <SafeIcon icon={config.icon} className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <SafeIcon icon={FiX} className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default React.memo(Toast);
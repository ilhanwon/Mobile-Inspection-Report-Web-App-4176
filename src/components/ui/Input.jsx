import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEye, FiEyeOff, FiAlertCircle, FiCheck } = FiIcons;

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  onFocus,
  error = '',
  success = false,
  disabled = false,
  required = false,
  icon = null,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseClasses = `
    transition-all duration-200 border rounded-xl bg-white
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-5 py-4 text-lg min-h-[52px]'
  };

  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500' 
    : success 
      ? 'border-green-300 focus:ring-green-500'
      : isFocused
        ? 'border-blue-300'
        : 'border-gray-200 hover:border-gray-300';

  const iconClasses = 'w-5 h-5 text-gray-400';
  const paddingWithIcon = icon && iconPosition === 'left' ? 'pl-10' : icon && iconPosition === 'right' ? 'pr-10' : '';
  const paddingWithPassword = isPassword ? 'pr-10' : '';

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <SafeIcon icon={icon} className={iconClasses} />
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            ${baseClasses} ${sizes[size]} ${stateClasses} 
            ${paddingWithIcon} ${paddingWithPassword} ${className}
          `}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <SafeIcon icon={icon} className={iconClasses} />
          </div>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
          </button>
        )}

        {/* Success Icon */}
        {success && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {/* Error/Success Message */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center space-x-1 text-sm ${
              error ? 'text-red-600' : 'text-green-600'
            }`}
          >
            <SafeIcon 
              icon={error ? FiAlertCircle : FiCheck} 
              className="w-4 h-4 flex-shrink-0" 
            />
            <span>{error || (success && '입력이 완료되었습니다.')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default React.memo(Input);
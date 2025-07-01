import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'sm',
  hover = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'bg-white rounded-2xl border transition-all duration-200';

  const variants = {
    default: 'border-gray-100',
    elevated: 'border-gray-200',
    outlined: 'border-gray-300',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const hoverEffects = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${shadows[shadow]} ${hoverEffects} ${className}`;

  if (onClick) {
    return (
      <motion.div
        ref={ref}
        className={classes}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        whileHover={hover ? { y: -2 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default React.memo(Card);
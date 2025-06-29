import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClipboard } = FiIcons;

function Header() {
  return (
    <motion.header
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <SafeIcon icon={FiClipboard} className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">소방점검 지적내역 작성</h1>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
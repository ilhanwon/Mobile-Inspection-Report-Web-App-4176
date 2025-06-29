import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClipboard, FiUser, FiLogOut } = FiIcons;

function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  return (
    <motion.header
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <SafeIcon icon={FiClipboard} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">소방시설 점검</h1>
              <p className="text-xs text-gray-500">팀 협업 지적사항 관리</p>
            </div>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUser} className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="로그아웃"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
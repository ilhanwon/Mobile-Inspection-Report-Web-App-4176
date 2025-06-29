import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiMapPin } = FiIcons;

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/sites', icon: FiMapPin, label: '현장', id: 'sites' },
    { path: '/create-inspection', icon: FiPlus, label: '점검', id: 'inspect' },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* 최대 너비 제한 및 중앙 정렬 */}
      <div className="max-w-md mx-auto relative">
        {/* 그라디언트 배경 효과 */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" />
        
        {/* 네비게이션 콘텐츠 */}
        <div className="relative bg-white px-4 py-3 pb-safe">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = item.path && (
                location.pathname === item.path ||
                (item.id === 'sites' && (
                  location.pathname.startsWith('/site') ||
                  location.pathname.startsWith('/inspection')
                ))
              );

              const handleClick = () => {
                if (item.path) {
                  navigate(item.path);
                }
              };

              return (
                <motion.button
                  key={item.id}
                  onClick={handleClick}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 min-h-[60px] min-w-[80px] ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-600"
                      layoutId="activeTab"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation;
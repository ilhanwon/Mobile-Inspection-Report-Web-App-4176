import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import BulkkunyangModal from './BulkkunyangModal';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiPlus, FiMessageCircle } = FiIcons;

function ImprovedNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showBulkkunyangModal, setShowBulkkunyangModal] = useState(false);

  const navItems = [
    {
      path: '/sites',
      icon: FiHome,
      label: '현장',
      id: 'sites'
    },
    {
      path: '/create-inspection',
      icon: FiPlus,
      label: '점검',
      id: 'inspect',
      isPrimary: true
    },
    {
      path: null,
      icon: FiMessageCircle,
      label: 'AI 도움',
      id: 'bulkkunyang',
      onClick: () => setShowBulkkunyangModal(true)
    }
  ];

  // 네비게이션 가시성 보장
  useEffect(() => {
    const ensureVisibility = () => {
      const navElement = document.querySelector('.simple-navigation');
      if (navElement) {
        navElement.style.position = 'fixed';
        navElement.style.bottom = '0';
        navElement.style.left = '0';
        navElement.style.right = '0';
        navElement.style.zIndex = '9999';
        navElement.style.display = 'block';
        navElement.style.visibility = 'visible';
        navElement.style.opacity = '1';
        navElement.style.transform = 'none';
        navElement.style.pointerEvents = 'auto';
      }
    };

    ensureVisibility();
    const intervalId = setInterval(ensureVisibility, 1000);

    const handleEvent = () => setTimeout(ensureVisibility, 50);
    
    window.addEventListener('resize', handleEvent);
    window.addEventListener('orientationchange', handleEvent);
    window.addEventListener('scroll', handleEvent, { passive: true });
    document.addEventListener('visibilitychange', handleEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleEvent);
      window.removeEventListener('orientationchange', handleEvent);
      window.removeEventListener('scroll', handleEvent);
      document.removeEventListener('visibilitychange', handleEvent);
    };
  }, []);

  return (
    <>
      {/* 심플한 네비게이션 */}
      <nav className="simple-navigation navigation-fixed force-navigation-visible">
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = item.path && (
                  location.pathname === item.path ||
                  (item.id === 'sites' && (
                    location.pathname.startsWith('/site') ||
                    location.pathname.startsWith('/inspection')
                  ))
                );

                const handleClick = () => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                };

                return (
                  <motion.button
                    key={item.id}
                    onClick={handleClick}
                    className={`
                      flex flex-col items-center justify-center py-2 px-4 min-w-[60px] min-h-[52px]
                      transition-all duration-200 ease-out
                      ${item.isPrimary 
                        ? 'bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600' 
                        : isActive 
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-gray-600'
                      }
                    `}
                    whileTap={{ scale: 0.95 }}
                    aria-label={item.label}
                  >
                    {/* 아이콘 */}
                    <SafeIcon 
                      icon={item.icon} 
                      className={`
                        w-6 h-6 mb-1 transition-transform duration-200
                        ${item.isPrimary ? 'text-white' : ''}
                        hover:scale-110
                      `}
                    />
                    
                    {/* 라벨 */}
                    <span className={`
                      text-xs font-medium
                      ${item.isPrimary ? 'text-white' : ''}
                    `}>
                      {item.label}
                    </span>

                    {/* 활성 상태 점 표시 */}
                    {isActive && !item.isPrimary && (
                      <motion.div
                        className="absolute -bottom-1 w-1 h-1 bg-red-500 rounded-full"
                        layoutId="activeIndicator"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 불끄냥 모달 */}
      <AnimatePresence>
        {showBulkkunyangModal && (
          <BulkkunyangModal onClose={() => setShowBulkkunyangModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default ImprovedNavigation;
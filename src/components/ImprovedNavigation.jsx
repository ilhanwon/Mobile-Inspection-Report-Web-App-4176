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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const navItems = [
    {
      path: '/sites',
      icon: FiHome,
      label: '현장',
      id: 'sites',
      color: 'text-red-500'
    },
    {
      path: '/create-inspection',
      icon: FiPlus,
      label: '점검',
      id: 'inspect',
      color: 'text-blue-500',
      isAction: true
    },
    {
      path: null,
      icon: FiMessageCircle,
      label: '불끄냥',
      id: 'bulkkunyang',
      color: 'text-orange-500',
      isModal: true,
      onClick: () => setShowBulkkunyangModal(true)
    }
  ];

  // 키보드 감지 (더 정확한 방법)
  useEffect(() => {
    let initialViewportHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // 키보드가 올라왔다고 판단하는 기준 (100px 이상 차이)
      setKeyboardVisible(heightDifference > 100);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        setKeyboardVisible(keyboardHeight > 100);
      }
    };

    // 초기 뷰포트 높이 저장
    const handleLoad = () => {
      initialViewportHeight = window.innerHeight;
    };

    // 이벤트 리스너 등록
    window.addEventListener('load', handleLoad);
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    // 초기 상태 설정
    handleResize();

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, []);

  return (
    <>
      {/* 완전 고정 네비게이션 - 애니메이션 제거하고 순수 CSS로 고정 */}
      <div
        className="navigation-container"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          pointerEvents: 'auto',
          transform: 'none',
          willChange: 'auto',
        }}
      >
        {/* 강력한 배경 블러 */}
        <div 
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '120px',
            background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 40%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        />

        {/* 메인 네비게이션 배경 */}
        <div 
          className="relative"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderTop: '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12), 0 -4px 16px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* 네비게이션 콘텐츠 */}
          <div className="max-w-md mx-auto">
            <div 
              className="px-6 py-4"
              style={{
                paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
              }}
            >
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
                    if (item.isModal && item.onClick) {
                      item.onClick();
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  };

                  return (
                    <button
                      key={item.id}
                      onClick={handleClick}
                      className={`
                        relative flex flex-col items-center space-y-2 p-3 rounded-2xl 
                        transition-all duration-200 ease-out
                        min-h-[68px] min-w-[68px] 
                        touch-manipulation
                        ${item.isAction
                          ? 'bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl scale-105 hover:scale-110'
                          : item.isModal
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 hover:border-orange-300'
                          : isActive
                          ? `${item.color} bg-red-50 border border-red-200`
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent'
                        }
                      `}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        minWidth: '68px',
                        minHeight: '68px',
                      }}
                    >
                      {/* 아이콘 */}
                      <SafeIcon
                        icon={item.icon}
                        className={`w-6 h-6 transition-transform duration-200 ${
                          item.isAction
                            ? 'text-white'
                            : item.isModal
                            ? 'text-orange-600'
                            : isActive
                            ? item.color
                            : 'text-gray-400'
                        }`}
                      />

                      {/* 라벨 */}
                      <span
                        className={`text-xs font-medium leading-tight ${
                          item.isAction
                            ? 'text-white'
                            : item.isModal
                            ? 'text-orange-600'
                            : isActive
                            ? item.color
                            : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* 활성 인디케이터 */}
                      {isActive && !item.isAction && !item.isModal && (
                        <div
                          className={`absolute -top-1 w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}
                        />
                      )}

                      {/* 불끄냥 버튼 특별 효과 */}
                      {item.isModal && item.id === 'bulkkunyang' && (
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full shadow-md flex items-center justify-center"
                        >
                          <span className="text-white text-xs">🔥</span>
                        </div>
                      )}

                      {/* 버튼 글로우 효과 (활성 상태) */}
                      {(isActive || item.isAction) && (
                        <div className="absolute inset-0 rounded-2xl bg-current opacity-5 pointer-events-none"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

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
import React, { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import AppHeader from './AppHeader';
import ImprovedNavigation from '../ImprovedNavigation';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../ui/ToastContainer';

// 에러 폴백 컴포넌트
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">문제가 발생했습니다</h2>
      <p className="text-gray-600 max-w-md">
        예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
      </p>
      <div className="space-x-3">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  </div>
);

function AppLayout({ children }) {
  const location = useLocation();
  const { toasts, removeToast } = useToast();

  // 뷰포트 높이 및 네비게이션 가시성 보장
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const ensureNavigationVisible = () => {
      // 네비게이션 요소 강제 표시
      const navElement = document.querySelector('.improved-navigation');
      if (navElement) {
        navElement.classList.add('navigation-fixed', 'force-navigation-visible');
      }

      // 메인 콘텐츠 하단 패딩 조정
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('main-content-adjusted');
      }
    };

    // 초기 설정
    setVH();
    ensureNavigationVisible();

    // 이벤트 리스너
    const handleResize = () => {
      setVH();
      setTimeout(ensureNavigationVisible, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setVH();
        ensureNavigationVisible();
      }, 300);
    };

    const handleScroll = () => {
      ensureNavigationVisible();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(ensureNavigationVisible, 100);
      }
    };

    // 이벤트 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 주기적으로 네비게이션 가시성 확인
    const intervalId = setInterval(ensureNavigationVisible, 1000);

    // 지연된 확인 (페이지 로드 완료 후)
    const timeoutIds = [
      setTimeout(ensureNavigationVisible, 500),
      setTimeout(ensureNavigationVisible, 1000),
      setTimeout(ensureNavigationVisible, 2000)
    ];

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
      timeoutIds.forEach(clearTimeout);
    };
  }, [location.pathname]);

  // 페이지별 헤더 설정 최적화
  const getPageConfig = React.useCallback(() => {
    const path = location.pathname;
    
    const configs = {
      '/sites': {
        title: '현장 관리',
        subtitle: '소방시설 점검 현장',
        showSearch: true,
        showAdd: true,
        addUrl: '/create-site',
        addLabel: '새 현장'
      },
      '/create-site': {
        title: '새 현장 등록',
        subtitle: '현장 정보를 입력하세요',
        showBack: true,
        backUrl: '/sites'
      },
      '/create-inspection': {
        title: '새 점검 시작',
        subtitle: '점검 정보를 입력하세요',
        showBack: true,
        backUrl: '/sites'
      }
    };

    // 동적 경로 처리
    if (path.startsWith('/site/')) {
      return {
        title: '현장 상세',
        subtitle: '현장 정보 및 점검 기록',
        showBack: true,
        backUrl: '/sites',
        showAdd: true,
        addLabel: '점검하기'
      };
    }
    
    if (path.startsWith('/inspection/')) {
      return {
        title: '점검 상세',
        subtitle: '지적사항 관리',
        showBack: true,
        backUrl: '/sites',
        showAdd: true,
        addLabel: '보고서'
      };
    }
    
    return configs[path] || {
      title: '소방시설 점검',
      subtitle: '지적사항 관리 시스템'
    };
  }, [location.pathname]);

  const config = getPageConfig();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Layout Error:', error, errorInfo);
      }}
    >
      <div className="app-container">
        {/* 상단 헤더 - 고정 */}
        <AppHeader {...config} />
        
        {/* 메인 콘텐츠 - 스크롤 가능 */}
        <main className="main-content flex-1 overflow-y-auto overflow-x-hidden">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="페이지 로딩 중..." />
              </div>
            }
          >
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(error, errorInfo) => {
                console.error('Content Error:', error, errorInfo);
              }}
            >
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full min-h-full"
              >
                {children}
              </motion.div>
            </ErrorBoundary>
          </Suspense>
        </main>
        
        {/* 하단 네비게이션 - 완전 고정 */}
        <ImprovedNavigation />
        
        {/* 토스트 컨테이너 */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(AppLayout);
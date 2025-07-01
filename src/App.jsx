import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { InspectionProvider } from './context/InspectionContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './App.css';

// 레이지 로드된 컴포넌트들
const SitesPage = React.lazy(() => import('./pages/SitesPage'));
const SiteDetailPage = React.lazy(() => import('./pages/SiteDetailPage'));
const InspectionDetailPage = React.lazy(() => import('./pages/InspectionDetailPage'));
const CreateSitePage = React.lazy(() => import('./pages/CreateSitePage'));
const CreateInspectionPage = React.lazy(() => import('./pages/CreateInspectionPage'));

// 에러 폴백 컴포넌트
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">문제가 발생했습니다</h2>
      <p className="text-gray-600 mb-6">
        예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          새로고침
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            기술적 세부사항
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

function App() {
  // 뷰포트 높이 최적화 및 네비게이션 가시성 보장
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const ensureNavigationVisible = () => {
      // 네비게이션 요소 강제 표시
      const navElements = document.querySelectorAll('.simple-navigation,.navigation-container');
      navElements.forEach(navElement => {
        if (navElement) {
          navElement.style.position = 'fixed';
          navElement.style.bottom = '0';
          navElement.style.left = '0';
          navElement.style.right = '0';
          navElement.style.zIndex = '99999';
          navElement.style.display = 'block';
          navElement.style.visibility = 'visible';
          navElement.style.opacity = '1';
          navElement.style.transform = 'none';
          navElement.style.pointerEvents = 'auto';
          navElement.style.background = 'white';
          navElement.style.borderTop = '1px solid #e5e7eb';
          navElement.style.boxShadow = '0 -4px 6px -1px rgba(0, 0, 0, 0.1)';
          navElement.style.paddingBottom = 'max(16px, env(safe-area-inset-bottom, 12px))';
          navElement.classList.add('navigation-fixed', 'force-navigation-visible');
        }
      });

      // 메인 콘텐츠 패딩 조정
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.paddingBottom = 'calc(84px + max(16px, env(safe-area-inset-bottom, 12px)))';
        mainContent.classList.add('main-content-adjusted');
      }
    };

    setVH();
    ensureNavigationVisible();

    // 디바운스된 리사이즈 핸들러
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setVH();
        ensureNavigationVisible();
      }, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setVH();
        ensureNavigationVisible();
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('scroll', ensureNavigationVisible, { passive: true });
    window.addEventListener('focus', ensureNavigationVisible);
    document.addEventListener('visibilitychange', ensureNavigationVisible);

    // 주기적으로 네비게이션 가시성 확인
    const intervalId = setInterval(ensureNavigationVisible, 1000);

    // 지연된 확인들
    const timeoutIds = [
      setTimeout(ensureNavigationVisible, 500),
      setTimeout(ensureNavigationVisible, 1000),
      setTimeout(ensureNavigationVisible, 2000)
    ];

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('scroll', ensureNavigationVisible);
      window.removeEventListener('focus', ensureNavigationVisible);
      document.removeEventListener('visibilitychange', ensureNavigationVisible);
      clearTimeout(resizeTimer);
      clearInterval(intervalId);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // 에러 로깅 (실제 서비스에서는 외부 서비스로 전송)
        console.error('Application Error:', error, errorInfo);
      }}
    >
      <InspectionProvider>
        <Router>
          <div className="app-container">
            <Suspense
              fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <LoadingSpinner size="xl" text="앱 로딩 중..." />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/sites" replace />} />
                <Route path="/sites" element={<SitesPage />} />
                <Route path="/site/:id" element={<SiteDetailPage />} />
                <Route path="/inspection/:id" element={<InspectionDetailPage />} />
                <Route path="/create-site" element={<CreateSitePage />} />
                <Route path="/create-inspection" element={<CreateInspectionPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </InspectionProvider>
    </ErrorBoundary>
  );
}

export default App;
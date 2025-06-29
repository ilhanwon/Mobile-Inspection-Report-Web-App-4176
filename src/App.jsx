import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InspectionProvider } from './context/InspectionContext';
import ImprovedSiteList from './components/ImprovedSiteList';
import CreateSite from './components/CreateSite';
import SiteDetail from './components/SiteDetail';
import CreateInspection from './components/CreateInspection';
import ImprovedInspectionDetail from './components/ImprovedInspectionDetail';
import ImprovedNavigation from './components/ImprovedNavigation';
import './App.css';

function App() {
  // 뷰포트 높이 최적화
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // 초기 설정
    setVH();

    // 리사이즈 시 재설정
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // 네비게이션 강제 표시 보장
    const ensureNavigationVisible = () => {
      setTimeout(() => {
        const navElement = document.querySelector('.navigation-container');
        if (navElement) {
          navElement.style.position = 'fixed';
          navElement.style.bottom = '0';
          navElement.style.zIndex = '99999';
          navElement.style.display = 'block';
          navElement.style.visibility = 'visible';
          navElement.style.opacity = '1';
          navElement.style.transform = 'none';
        }
      }, 100);
    };

    // 다양한 이벤트에서 네비게이션 가시성 보장
    ensureNavigationVisible();
    window.addEventListener('load', ensureNavigationVisible);
    window.addEventListener('resize', ensureNavigationVisible);
    window.addEventListener('scroll', ensureNavigationVisible);
    document.addEventListener('DOMContentLoaded', ensureNavigationVisible);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      window.removeEventListener('load', ensureNavigationVisible);
      window.removeEventListener('resize', ensureNavigationVisible);
      window.removeEventListener('scroll', ensureNavigationVisible);
      document.removeEventListener('DOMContentLoaded', ensureNavigationVisible);
    };
  }, []);

  return (
    <InspectionProvider>
      <Router>
        <div 
          className="min-h-screen bg-gray-50 relative"
          style={{
            minHeight: 'calc(var(--vh, 1vh) * 100)',
            position: 'relative',
            overflow: 'hidden auto',
          }}
        >
          {/* 메인 콘텐츠 */}
          <main 
            className="main-content-with-nav safe-area-inset"
            style={{
              paddingBottom: '120px',
              minHeight: 'calc(var(--vh, 1vh) * 100)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/sites" replace />} />
              <Route path="/sites" element={<ImprovedSiteList />} />
              <Route path="/create-site" element={<CreateSite />} />
              <Route path="/site/:id" element={<SiteDetail />} />
              <Route path="/create-inspection" element={<CreateInspection />} />
              <Route path="/inspection/:id" element={<ImprovedInspectionDetail />} />
            </Routes>
          </main>

          {/* 완전 고정 네비게이션 */}
          <ImprovedNavigation />
        </div>
      </Router>
    </InspectionProvider>
  );
}

export default App;
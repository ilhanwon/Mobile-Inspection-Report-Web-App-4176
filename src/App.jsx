import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginForm from './components/auth/LoginForm';
import SiteList from './components/SiteList';
import CreateSite from './components/CreateSite';
import SiteDetail from './components/SiteDetail';
import CreateInspection from './components/CreateInspection';
import InspectionDetail from './components/InspectionDetail';
import { InspectionProvider } from './context/InspectionContext';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  // AgentFlow 챗봇 스크립트를 앱 시작과 동시에 로드
  useEffect(() => {
    if (!user) return; // 로그인한 사용자만 챗봇 로드

    // 즉시 스크립트 로드
    const loadChatbot = () => {
      const script = document.createElement('script');
      script.id = 'agenticflow-agent-global';
      script.src = 'https://agenticflow.ai/scripts/agent.js';
      script.setAttribute('data-agent-id', '6cbf1565-408b-46df-99e1-155b96997f8d');
      script.async = true;
      script.onload = () => {
        console.log('AgentFlow 챗봇 로드 완료');
        // 챗봇 버튼이 즉시 나타나도록 설정
        const ensureChatbotVisible = () => {
          const chatButton = document.getElementById('agenticflow-chat-bubble-button');
          if (chatButton) {
            chatButton.style.display = 'flex';
            chatButton.style.position = 'fixed';
            chatButton.style.bottom = '5rem'; // 네비게이션 위에 표시
            chatButton.style.right = '1rem';
            chatButton.style.zIndex = '9999';
            chatButton.style.opacity = '1';
            chatButton.style.visibility = 'visible';
            console.log('챗봇 버튼 표시됨');
          } else {
            // 버튼이 아직 생성되지 않았다면 다시 시도
            setTimeout(ensureChatbotVisible, 100);
          }
        };
        // 즉시 실행하고, 추가로 몇 번 더 확인
        ensureChatbotVisible();
        setTimeout(ensureChatbotVisible, 500);
        setTimeout(ensureChatbotVisible, 1000);
      };
      script.onerror = () => {
        console.error('AgentFlow 챗봇 로드 실패');
      };
      document.head.appendChild(script);
    };

    // DOM이 준비되면 즉시 로드
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadChatbot);
    } else {
      loadChatbot();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', loadChatbot);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <InspectionProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pb-24 safe-area-inset"> {/* 네비게이션 높이만큼 여백 추가 */}
          <Routes>
            <Route path="/" element={<Navigate to="/sites" replace />} />
            <Route path="/sites" element={<SiteList />} />
            <Route path="/create-site" element={<CreateSite />} />
            <Route path="/site/:id" element={<SiteDetail />} />
            <Route path="/create-inspection" element={<CreateInspection />} />
            <Route path="/inspection/:id" element={<InspectionDetail />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </InspectionProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
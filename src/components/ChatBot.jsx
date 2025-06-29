import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft } = FiIcons;

// 불끄냥 아이콘 컴포넌트
const FireCatIcon = ({ className }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className}
    fill="currentColor"
  >
    {/* 고양이 머리 */}
    <circle cx="32" cy="28" r="18" fill="#FF6B35" />
    
    {/* 귀 */}
    <polygon points="20,18 16,8 28,14" fill="#FF4500" />
    <polygon points="44,18 48,8 36,14" fill="#FF4500" />
    
    {/* 내부 귀 */}
    <polygon points="22,16 19,10 26,13" fill="#FFB366" />
    <polygon points="42,16 45,10 38,13" fill="#FFB366" />
    
    {/* 눈 */}
    <ellipse cx="26" cy="25" rx="3" ry="4" fill="#000" />
    <ellipse cx="38" cy="25" rx="3" ry="4" fill="#000" />
    <ellipse cx="26" cy="24" rx="1" ry="1.5" fill="#FFF" />
    <ellipse cx="38" cy="24" rx="1" ry="1.5" fill="#FFF" />
    
    {/* 코 */}
    <polygon points="32,30 30,33 34,33" fill="#FF1744" />
    
    {/* 입 */}
    <path d="M 32 33 Q 28 36 26 34" stroke="#000" strokeWidth="1.5" fill="none" />
    <path d="M 32 33 Q 36 36 38 34" stroke="#000" strokeWidth="1.5" fill="none" />
    
    {/* 수염 */}
    <line x1="15" y1="28" x2="22" y2="27" stroke="#000" strokeWidth="1" />
    <line x1="15" y1="32" x2="22" y2="31" stroke="#000" strokeWidth="1" />
    <line x1="42" y1="27" x2="49" y2="28" stroke="#000" strokeWidth="1" />
    <line x1="42" y1="31" x2="49" y2="32" stroke="#000" strokeWidth="1" />
    
    {/* 불꽃 효과 */}
    <path d="M 20 12 Q 18 8 22 6 Q 20 4 24 5 Q 26 2 28 6" fill="#FFD700" opacity="0.8" />
    <path d="M 44 12 Q 46 8 42 6 Q 44 4 40 5 Q 38 2 36 6" fill="#FFD700" opacity="0.8" />
    <path d="M 32 8 Q 30 4 34 2 Q 32 0 36 1 Q 38 -2 40 2" fill="#FF4500" opacity="0.7" />
  </svg>
);

function ChatBot() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 기존 챗봇 스크립트 제거
    const existingScript = document.getElementById('agenticflow-agent');
    if (existingScript) {
      existingScript.remove();
    }

    // 챗봇 컨테이너 생성
    const chatContainer = document.getElementById('chatbot-container');
    if (chatContainer) {
      chatContainer.innerHTML = '';
    }

    // 새 챗봇 스크립트 로드
    const script = document.createElement('script');
    script.id = 'agenticflow-agent';
    script.src = 'https://agenticflow.ai/scripts/agent.js';
    script.setAttribute('data-agent-id', '6cbf1565-408b-46df-99e1-155b96997f8d');
    script.async = true;
    
    script.onload = () => {
      console.log('불끄냥 챗봇 로드 완료');
      setIsLoading(false);
      
      // 챗봇 버튼이 항상 보이도록 설정
      setTimeout(() => {
        const agentWidget = document.querySelector('[data-agent-id="6cbf1565-408b-46df-99e1-155b96997f8d"]');
        const chatButton = document.getElementById('agenticflow-chat-bubble-button');
        
        if (chatButton) {
          // 챗봇 버튼 스타일 유지 (숨기지 않음)
          chatButton.style.display = 'flex';
          chatButton.style.position = 'fixed';
          chatButton.style.bottom = '1rem';
          chatButton.style.right = '1rem';
          chatButton.style.zIndex = '9998';
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error('불끄냥 챗봇 로드 실패');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* 헤더 */}
      <motion.div
        className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-sm z-40 px-4 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => navigate('/sites')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span className="font-medium">뒤로</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <FireCatIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">불끄냥</h1>
              <p className="text-xs text-gray-500">소방시설 AI 도우미</p>
            </div>
          </div>
          
          <div className="w-16"></div> {/* 균형을 위한 공간 */}
        </div>
      </motion.div>

      {/* 로딩 화면 */}
      {isLoading && (
        <motion.div
          className="flex flex-col items-center justify-center min-h-[60vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FireCatIcon className="w-16 h-16 text-orange-500" />
            </motion.div>
            
            {/* 불꽃 효과 */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-2xl">🔥</span>
            </motion.div>
          </div>
          
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">불끄냥이 준비중이에요</h2>
            <p className="text-gray-600">소방시설 관련 질문을 도와드릴게요!</p>
          </motion.div>
          
          {/* 로딩 도트 */}
          <div className="flex space-x-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* 챗봇 컨테이너 */}
      <div 
        id="chatbot-container" 
        className={`w-full ${isLoading ? 'hidden' : 'block'}`}
        style={{ minHeight: 'calc(100vh - 80px)' }}
      />

      {/* 대체 콘텐츠 (챗봇 로드 실패 시) */}
      {!isLoading && (
        <motion.div
          className="max-w-md mx-auto p-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <FireCatIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">불끄냥과 대화하기</h3>
            <p className="text-gray-600 text-sm mb-4">
              소방시설 점검, 안전 규정, 장비 관리 등<br />
              궁금한 것이 있으면 언제든 물어보세요!
            </p>
            
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>🔥</span>
                <span>소방시설 전문 지식</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>📋</span>
                <span>점검 가이드라인</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>실시간 답변</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ChatBot;
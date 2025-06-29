import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiMessageCircle, FiRefreshCw } = FiIcons;

// 불끄냥 아이콘 컴포넌트
const FireCatIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor">
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

function BulkkunyangModal({ onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // iframe 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [key]);

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md h-[600px] overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-2 bg-white/20 rounded-xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <FireCatIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold">불끄냥</h3>
                <p className="text-sm text-orange-100">소방시설 AI 도우미</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                title="새로고침"
              >
                <SafeIcon icon={FiRefreshCw} className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                title="닫기"
              >
                <SafeIcon icon={FiX} className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 relative h-[520px]">
          {/* 로딩 화면 */}
          {isLoading && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative mb-6">
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
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">불끄냥이 준비중이에요</h3>
                <p className="text-gray-600 text-sm">소방시설 관련 질문을 도와드릴게요!</p>
              </motion.div>

              {/* 로딩 도트 */}
              <div className="flex space-x-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* iframe 챗봇 */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <iframe
              key={key}
              style={{ minHeight: '380px' }}
              src="https://agenticflow.ai/embed/agents/6cbf1565-408b-46df-99e1-155b96997f8d?theme=orange"
              width="100%"
              height="100%"
              frameBorder="0"
              title="불끄냥 챗봇"
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
            />
          </motion.div>
        </div>

        {/* 하단 안내 */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <SafeIcon icon={FiMessageCircle} className="w-4 h-4 text-orange-500" />
            <span>소방시설 점검, 안전 규정, 장비 관리 등 궁금한 것을 물어보세요!</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default BulkkunyangModal;
import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMenu, FiSearch, FiPlus } = FiIcons;

function ImprovedHeader({ 
  title = "소방점검", 
  subtitle = "지적내역 관리",
  onMenuClick,
  onSearchClick,
  onAddClick,
  showSearch = false,
  showAdd = false,
  compact = false
}) {
  return (
    <motion.header
      className={`bg-gradient-to-r from-red-500 to-red-600 text-white sticky top-0 z-50 shadow-lg ${
        compact ? 'py-2' : 'py-3'
      }`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 메뉴 버튼 */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200 touch-manipulation"
            aria-label="메뉴"
          >
            <SafeIcon icon={FiMenu} className="w-6 h-6" />
          </button>

          {/* 중앙: 타이틀 */}
          <div className="flex-1 text-center mx-4">
            <h1 className={`font-bold text-white ${compact ? 'text-lg' : 'text-xl'}`}>
              {title}
            </h1>
            {!compact && subtitle && (
              <p className="text-red-100 text-xs opacity-90">{subtitle}</p>
            )}
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center space-x-1">
            {showSearch && (
              <button
                onClick={onSearchClick}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200 touch-manipulation"
                aria-label="검색"
              >
                <SafeIcon icon={FiSearch} className="w-5 h-5" />
              </button>
            )}
            {showAdd && (
              <button
                onClick={onAddClick}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 touch-manipulation"
                aria-label="추가"
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default ImprovedHeader;
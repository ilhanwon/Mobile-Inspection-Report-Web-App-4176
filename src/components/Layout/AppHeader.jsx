import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import Button from '../ui/Button';
import * as FiIcons from 'react-icons/fi';

const { 
  FiArrowLeft, 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiMenu,
  FiShare,
  FiMoreVertical 
} = FiIcons;

const AppHeader = React.memo(({ 
  title = '소방시설 점검',
  subtitle = '',
  showBack = false,
  backUrl = '/sites',
  showSearch = false,
  showAdd = false,
  addUrl = '',
  addLabel = '추가',
  onSearchChange = null,
  onAddClick = null,
  customActions = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBackClick = useCallback(() => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  }, [navigate, backUrl]);

  const handleAddClick = useCallback(() => {
    if (onAddClick) {
      onAddClick();
    } else if (addUrl) {
      navigate(addUrl);
    }
  }, [onAddClick, addUrl, navigate]);

  const handleSearchToggle = useCallback(() => {
    setShowSearchInput(prev => !prev);
    if (showSearchInput) {
      setSearchQuery('');
      onSearchChange?.('');
    }
  }, [showSearchInput, onSearchChange]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  return (
    <>
      {/* 메인 헤더 */}
      <motion.header 
        className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg z-50"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 뒤로가기 또는 메뉴 */}
            <div className="flex items-center min-w-0">
              {showBack ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiArrowLeft}
                  onClick={handleBackClick}
                  className="p-2 hover:bg-white/10 text-white mr-3"
                  aria-label="뒤로가기"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiMenu}
                  className="p-2 hover:bg-white/10 text-white mr-3"
                  aria-label="메뉴"
                />
              )}
              
              {/* 제목 영역 */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-red-100 text-xs opacity-90 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* 오른쪽: 액션 버튼들 */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* 검색 버튼 */}
              {showSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={showSearchInput ? FiX : FiSearch}
                  onClick={handleSearchToggle}
                  className={`p-2 rounded-xl transition-colors duration-200 ${
                    showSearchInput 
                      ? 'bg-white/20 text-white' 
                      : 'hover:bg-white/10 text-white'
                  }`}
                  aria-label="검색"
                />
              )}

              {/* 추가 버튼 */}
              {showAdd && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiPlus}
                  onClick={handleAddClick}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2"
                  aria-label={addLabel}
                >
                  <span className="text-sm font-medium hidden sm:inline ml-1">
                    {addLabel}
                  </span>
                </Button>
              )}

              {/* 커스텀 액션 버튼들 */}
              {customActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  icon={action.icon}
                  onClick={action.onClick}
                  className={`p-2 rounded-xl transition-colors duration-200 ${
                    action.className || 'hover:bg-white/10 text-white'
                  }`}
                  aria-label={action.label}
                />
              ))}

              {/* 더보기 메뉴 */}
              {(customActions.length > 0 || location.pathname.startsWith('/inspection/')) && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiMoreVertical}
                  className="p-2 hover:bg-white/10 text-white"
                  aria-label="더보기"
                />
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* 검색바 (펼쳐짐) */}
      <AnimatePresence>
        {showSearchInput && (
          <motion.div
            className="bg-white border-b border-gray-200 shadow-sm z-40"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-md mx-auto px-4 py-3">
              <div className="relative">
                <SafeIcon 
                  icon={FiSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="검색어를 입력하세요..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200 text-base"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiX}
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;
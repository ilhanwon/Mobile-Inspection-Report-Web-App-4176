import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import ImprovedHeader from './ImprovedHeader';
import { useInspectionData } from '../hooks/useInspectionData';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiFileText, FiTrash2, FiEye, FiPlus, FiPhone, FiUser, FiSearch, FiX, FiChevronRight, FiClock, FiAlertCircle, FiGrid, FiList } = FiIcons;

function ImprovedSiteList() {
  const navigate = useNavigate();
  const { sites, getInspectionStats } = useInspectionData();
  const { deleteSite, setCurrentSite } = useInspection();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // 검색 기능
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const query = searchQuery.toLowerCase();
    return sites.filter(site =>
      site.name.toLowerCase().includes(query) ||
      site.address.toLowerCase().includes(query) ||
      (site.manager_name && site.manager_name.toLowerCase().includes(query))
    );
  }, [sites, searchQuery]);

  const handleViewSite = (site) => {
    setCurrentSite(site);
    navigate(`/site/${site.id}`);
  };

  const handleDeleteSite = async (siteId, e) => {
    e.stopPropagation();
    if (window.confirm('이 현장을 삭제하시겠습니까?')) {
      try {
        await deleteSite(siteId);
      } catch (error) {
        alert('현장 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 개선된 헤더 */}
      <ImprovedHeader
        title="현장 관리"
        subtitle={`${filteredSites.length}개 현장`}
        onSearchClick={handleSearchToggle}
        onAddClick={() => navigate('/create-site')}
        showSearch={true}
        showAdd={true}
      />

      {/* 검색바 (펼쳐짐) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="bg-white border-b border-gray-200 px-4 py-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-md mx-auto relative">
              <SafeIcon
                icon={FiSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="현장명, 주소, 관리자명으로 검색..."
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200 text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto">
        {/* 뷰 모드 전환 & 통계 */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {searchQuery ? (
                <span className="text-red-600 font-medium">
                  "{searchQuery}" 검색결과 {filteredSites.length}개
                </span>
              ) : (
                <span>총 {sites.length}개 현장</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'
              }`}
            >
              <SafeIcon icon={FiGrid} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'
              }`}
            >
              <SafeIcon icon={FiList} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 현장 목록 */}
        <div className="p-4">
          <AnimatePresence>
            {filteredSites.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {searchQuery ? (
                  <>
                    <SafeIcon icon={FiSearch} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-400 mb-6">다른 키워드로 검색해보세요</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium"
                    >
                      전체 현장 보기
                    </button>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiMapPin} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">등록된 현장이 없습니다</h3>
                    <p className="text-gray-400 mb-6">첫 번째 현장을 등록해보세요</p>
                    <button
                      onClick={() => navigate('/create-site')}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium"
                    >
                      현장 등록하기
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <div className={`space-y-3 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : ''}`}>
                {filteredSites.map((site, index) => {
                  const stats = getInspectionStats(site.id);
                  return (
                    <motion.div
                      key={site.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleViewSite(site)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-4">
                        {/* 헤더 영역 */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 truncate">{site.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 truncate flex items-center">
                              <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1 flex-shrink-0" />
                              {site.address}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => handleDeleteSite(site.id, e)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="현장 삭제"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                            <SafeIcon icon={FiChevronRight} className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* 상세 정보 */}
                        <div className="space-y-2">
                          {/* 관리자 정보 */}
                          {site.manager_name && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <SafeIcon icon={FiUser} className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{site.manager_name}</span>
                              {site.manager_phone && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>{site.manager_phone}</span>
                                </>
                              )}
                            </div>
                          )}

                          {/* 연락처 */}
                          {site.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <SafeIcon icon={FiPhone} className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span>{site.phone}</span>
                            </div>
                          )}

                          {/* 점검 기록 */}
                          {stats.total > 0 && (
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <SafeIcon icon={FiFileText} className="w-4 h-4" />
                                <span>점검 기록 {stats.total}건</span>
                              </div>
                            </div>
                          )}

                          {/* 점검 대기 상태 */}
                          {stats.total === 0 && (
                            <div className="flex items-center space-x-2 text-sm text-amber-600 pt-2 border-t border-gray-100">
                              <SafeIcon icon={FiClock} className="w-4 h-4" />
                              <span>점검 대기 중</span>
                            </div>
                          )}
                        </div>

                        {/* 특이사항 알림 */}
                        {site.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 text-sm text-amber-600">
                              <SafeIcon icon={FiAlertCircle} className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">특이사항 있음</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ImprovedSiteList;
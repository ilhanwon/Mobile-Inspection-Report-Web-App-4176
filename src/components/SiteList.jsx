import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { useInspectionData } from '../hooks/useInspectionData';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiFileText, FiTrash2, FiEye, FiPlus, FiPhone, FiUser, FiSearch, FiX, FiMail, FiCalendar } = FiIcons;

function SiteList() {
  const navigate = useNavigate();
  const { sites, getInspectionStats } = useInspectionData();
  const { deleteSite, setCurrentSite } = useInspection();
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 기능 - 현장명, 주소, 관리자명으로 검색
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

  const clearSearch = () => {
    setSearchQuery('');
  };

  const StatItem = ({ icon, count, label, color = "text-gray-600" }) => (
    <div className="flex items-center space-x-1">
      <SafeIcon icon={icon} className={`w-4 h-4 ${color}`} />
      <span className={color}>{count}건 {label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* 헤더 */}
        <motion.div
          className="flex items-center justify-between pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">현장 목록</h2>
            <p className="text-sm text-gray-500">
              {searchQuery ? `검색결과 ${filteredSites.length}개` : `총 ${sites.length}개 현장`}
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/create-site')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>새 현장</span>
          </motion.button>
        </motion.div>

        {/* 검색바 */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="relative">
            <SafeIcon
              icon={FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="현장명, 주소, 관리자명으로 검색..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* 현장 목록 */}
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
                    onClick={clearSearch}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
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
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                  >
                    현장 등록하기
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredSites.map((site, index) => {
                const stats = getInspectionStats(site.id);
                return (
                  <motion.div
                    key={site.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleViewSite(site)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <SafeIcon icon={FiMapPin} className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{site.name}</h3>
                            <p className="text-sm text-gray-500">{site.address}</p>
                          </div>
                        </div>

                        {/* 추가 정보 표시 */}
                        <div className="space-y-2 mb-3">
                          {site.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <SafeIcon icon={FiPhone} className="w-3 h-3" />
                              <span>{site.phone}</span>
                            </div>
                          )}

                          {site.manager_name && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <SafeIcon icon={FiUser} className="w-3 h-3" />
                              <span>관리자: {site.manager_name}</span>
                            </div>
                          )}

                          {site.manager_phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <SafeIcon icon={FiPhone} className="w-3 h-3" />
                              <span>관리자: {site.manager_phone}</span>
                            </div>
                          )}

                          {site.approval_date && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                              <span>승인일: {new Date(site.approval_date).toLocaleDateString('ko-KR')}</span>
                            </div>
                          )}
                        </div>

                        {/* 통계 정보 */}
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <StatItem
                                icon={FiFileText}
                                count={stats.total}
                                label=""
                                color="text-gray-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={(e) => handleDeleteSite(site.id, e)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="현장 삭제"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                        <SafeIcon icon={FiEye} className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SiteList;
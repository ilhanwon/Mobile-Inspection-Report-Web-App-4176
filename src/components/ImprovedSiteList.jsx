import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import Card from './ui/Card';
import Button from './ui/Button';
import { useInspectionData } from '../hooks/useInspectionData';
import { useInspection } from '../context/InspectionContext';
import { useToast } from '../hooks/useToast';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMapPin, 
  FiFileText, 
  FiTrash2, 
  FiEye, 
  FiPhone, 
  FiUser, 
  FiChevronRight, 
  FiClock, 
  FiAlertCircle,
  FiPlus 
} = FiIcons;

// 사이트 카드 컴포넌트 분리 (성능 최적화)
const SiteCard = React.memo(({ site, stats, onView, onDelete }) => {
  const handleView = useCallback(() => {
    onView(site);
  }, [site, onView]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(site.id, e);
  }, [site.id, onDelete]);

  return (
    <Card
      hover
      className="cursor-pointer overflow-hidden"
      onClick={handleView}
    >
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
          <Button
            variant="ghost"
            size="sm"
            icon={FiTrash2}
            onClick={handleDelete}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50"
            aria-label="현장 삭제"
          />
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
        {stats.total > 0 ? (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-gray-600">
              <SafeIcon icon={FiFileText} className="w-4 h-4" />
              <span>점검 기록 {stats.total}건</span>
            </div>
          </div>
        ) : (
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
    </Card>
  );
});

SiteCard.displayName = 'SiteCard';

// 빈 상태 컴포넌트
const EmptyState = React.memo(({ searchQuery, onCreateSite }) => (
  <Card className="text-center py-16">
    {searchQuery ? (
      <>
        <SafeIcon icon={FiMapPin} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-400 mb-6">다른 키워드로 검색해보세요</p>
      </>
    ) : (
      <>
        <SafeIcon icon={FiMapPin} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">등록된 현장이 없습니다</h3>
        <p className="text-gray-400 mb-6">첫 번째 현장을 등록해보세요</p>
        <Button
          icon={FiPlus}
          onClick={onCreateSite}
          className="mx-auto"
        >
          현장 등록하기
        </Button>
      </>
    )}
  </Card>
));

EmptyState.displayName = 'EmptyState';

function ImprovedSiteList({ searchQuery = '' }) {
  const navigate = useNavigate();
  const { sites, getInspectionStats } = useInspectionData();
  const { deleteSite, setCurrentSite } = useInspection();
  const { success, error } = useToast();

  // 검색 기능 최적화
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const query = searchQuery.toLowerCase();
    return sites.filter(site =>
      site.name.toLowerCase().includes(query) ||
      site.address.toLowerCase().includes(query) ||
      (site.manager_name && site.manager_name.toLowerCase().includes(query))
    );
  }, [sites, searchQuery]);

  const handleViewSite = useCallback((site) => {
    setCurrentSite(site);
    navigate(`/site/${site.id}`);
  }, [setCurrentSite, navigate]);

  const handleDeleteSite = useCallback(async (siteId, e) => {
    e.stopPropagation();
    if (window.confirm('이 현장을 삭제하시겠습니까?')) {
      try {
        await deleteSite(siteId);
        success('현장이 성공적으로 삭제되었습니다.');
      } catch (err) {
        error('현장 삭제 중 오류가 발생했습니다.');
      }
    }
  }, [deleteSite, success, error]);

  const handleCreateSite = useCallback(() => {
    navigate('/create-site');
  }, [navigate]);

  return (
    <div className="p-4 pb-0">
      {/* 통계 정보 */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">현장 현황</h2>
            <p className="text-sm text-gray-500">
              {searchQuery ? (
                <span className="text-red-600 font-medium">
                  "{searchQuery}" 검색결과 {filteredSites.length}개
                </span>
              ) : (
                <span>총 {sites.length}개 현장 관리 중</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{filteredSites.length}</div>
            <div className="text-xs text-gray-500">현장</div>
          </div>
        </div>
      </Card>

      {/* 현장 목록 */}
      <div className="space-y-3 pb-4">
        <AnimatePresence mode="wait">
          {filteredSites.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState 
                searchQuery={searchQuery} 
                onCreateSite={handleCreateSite}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredSites.map((site, index) => {
                const stats = getInspectionStats(site.id);
                
                return (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <SiteCard
                      site={site}
                      stats={stats}
                      onView={handleViewSite}
                      onDelete={handleDeleteSite}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default React.memo(ImprovedSiteList);
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCheck, FiMapPin, FiList, FiEdit3, FiClock, FiChevronDown } = FiIcons;

function IssueForm({ onSubmit, onCancel, editingIssue = null }) {
  const { getSortedIssueHistory, getSortedLocationHistory, inspections, sites } = useInspection();
  const [formData, setFormData] = useState({
    facilityType: editingIssue?.facility_type || '소화설비',
    description: editingIssue?.description || '',
    location: editingIssue?.location || '',
    detailLocation: editingIssue?.detail_location || '',
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(!!editingIssue?.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 점검 정보 가져오기 (URL에서 inspection ID 추출)
  const currentInspectionId = window.location.pathname.includes('/inspection/') 
    ? window.location.pathname.split('/inspection/')[1] 
    : null;
  const currentInspection = inspections.find(i => i.id === currentInspectionId);
  const currentSite = currentInspection ? sites.find(s => s.id === currentInspection.site_id) : null;

  // 설비명과 권고사항 정의
  const facilityTypes = [
    '소화설비',
    '경보설비', 
    '피난구조설비',
    '소화용수설비',
    '소화활동설비',
    '안전시설등',
    '권고사항',
    '기타'
  ];

  const issueHistory = getSortedIssueHistory().slice(0, 10);
  const locationHistory = getSortedLocationHistory().slice(0, 10);

  // 최근 위치를 기본값으로 설정 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!editingIssue && locationHistory.length > 0 && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: locationHistory[0].location
      }));
    }
  }, [locationHistory, editingIssue, formData.location]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHistorySelect = (description) => {
    setFormData(prev => ({
      ...prev,
      description
    }));
    setShowHistory(false);
    setIsCustomInput(false);
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
    setShowLocationHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.location.trim()) {
      alert('불량내용과 위치를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* 헤더 - 더 간소화 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 text-center mx-3">
            <h1 className="text-base font-bold text-gray-900">
              {editingIssue ? '지적사항 수정' : '지적사항 추가'}
            </h1>
            {/* 더 간소화된 점검 정보 */}
            {currentSite && currentInspection && (
              <span className="text-xs text-gray-500 truncate block max-w-xs mx-auto">
                {currentSite.name} • {currentInspection.inspector}
              </span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.description.trim() || !formData.location.trim()}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              isSubmitting || !formData.description.trim() || !formData.location.trim()
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            {isSubmitting ? '저장중' : (editingIssue ? '수정' : '추가')}
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-20">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 설비명 선택 - 컴팩트 버전 */}
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                설비명 *
              </label>
              <div className="relative">
                <select
                  value={formData.facilityType}
                  onChange={(e) => handleInputChange('facilityType', e.target.value)}
                  className={`px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium appearance-none bg-white min-w-32 ${
                    formData.facilityType === '권고사항' 
                      ? 'text-green-700 bg-green-50 border-green-200' 
                      : 'text-gray-900'
                  }`}
                  required
                >
                  {facilityTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {/* 커스텀 드롭다운 아이콘 */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* 권고사항 선택 시 간단한 안내 */}
            {formData.facilityType === '권고사항' && (
              <motion.div
                className="p-2 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-800">개선 권고사항으로 기록됩니다</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* 불량내용 입력 - 컴팩트 버전 */}
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                {formData.facilityType === '권고사항' ? '권고내용' : '불량내용'} *
              </label>
              {!editingIssue && (
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-lg transition-colors duration-200 ${
                      showHistory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <SafeIcon icon={FiList} className="w-3 h-3" />
                    <span>히스토리</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomInput(!isCustomInput);
                      setShowHistory(false);
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-lg transition-colors duration-200 ${
                      isCustomInput ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <SafeIcon icon={FiEdit3} className="w-3 h-3" />
                    <span>직접입력</span>
                  </button>
                </div>
              )}
            </div>

            {!editingIssue && (
              <AnimatePresence>
                {showHistory && issueHistory.length > 0 && (
                  <motion.div
                    className="mb-3 bg-gray-50 rounded-lg p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {issueHistory.slice(0, 5).map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleHistorySelect(item.description)}
                          className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 active:scale-98"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex-1 text-xs font-medium text-gray-900 truncate">{item.description}</span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded ml-2">
                              {item.count}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {(editingIssue || isCustomInput || !showHistory || issueHistory.length === 0) && (
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={formData.facilityType === '권고사항' ? "권고내용을 구체적으로 입력하세요" : "불량내용을 구체적으로 입력하세요"}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                required
              />
            )}
          </motion.div>

          {/* 위치 입력 - 컴팩트 버전 */}
          <motion.div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="space-y-3">
              {/* 위치 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1 text-blue-500" />
                    위치 *
                  </label>
                  {!editingIssue && (
                    <button
                      type="button"
                      onClick={() => setShowLocationHistory(!showLocationHistory)}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-lg transition-colors duration-200 ${
                        showLocationHistory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <SafeIcon icon={FiClock} className="w-3 h-3" />
                      <span>최근</span>
                    </button>
                  )}
                </div>

                {!editingIssue && (
                  <AnimatePresence>
                    {showLocationHistory && locationHistory.length > 0 && (
                      <motion.div
                        className="mb-2 bg-gray-50 rounded-lg p-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {locationHistory.slice(0, 4).map((item, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleLocationSelect(item.location)}
                              className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 active:scale-98"
                            >
                              <span className="text-xs font-medium text-gray-900">{item.location}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="예: 101동 2계단"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>

              {/* 상세위치 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  상세위치
                </label>
                <input
                  type="text"
                  value={formData.detailLocation}
                  onChange={(e) => handleInputChange('detailLocation', e.target.value)}
                  placeholder="예: 3층,지하1층"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </motion.div>
        </form>
      </div>

      {/* 하단 고정 버튼 영역 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.description.trim() || !formData.location.trim()}
            className={`flex-2 py-3 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
              isSubmitting || !formData.description.trim() || !formData.location.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : formData.facilityType === '권고사항'
                  ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-lg'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg'
            }`}
          >
            <SafeIcon icon={FiCheck} className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? '저장 중...' 
                : editingIssue 
                  ? '수정 완료' 
                  : formData.facilityType === '권고사항' 
                    ? '권고사항 추가' 
                    : '지적사항 추가'
              }
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default IssueForm;
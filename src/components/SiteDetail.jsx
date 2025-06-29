import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import { formatDateShort } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiMapPin, FiFileText, FiPlus, FiEye, FiTrash2, FiUser, FiCalendar, FiEdit2, FiSave, FiX, FiPhone, FiMail } = FiIcons;

function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sites, getInspectionsBySite, setCurrentInspection, deleteInspection, updateSite } = useInspection();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const site = sites.find(s => s.id === id);
  const inspections = getInspectionsBySite(id);

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <SafeIcon icon={FiMapPin} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">현장을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/sites')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleViewInspection = (inspection) => {
    setCurrentInspection(inspection);
    navigate(`/inspection/${inspection.id}`);
  };

  const handleDeleteInspection = async (inspectionId, e) => {
    e.stopPropagation();
    if (window.confirm('이 점검을 삭제하시겠습니까?')) {
      try {
        await deleteInspection(inspectionId);
      } catch (error) {
        console.error('점검 삭제 에러:', error);
        alert('점검 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditSite = () => {
    setEditData({
      name: site.name || '',
      address: site.address || '',
      phone: site.phone || '',
      manager_name: site.manager_name || '',
      manager_phone: site.manager_phone || '',
      manager_email: site.manager_email || '',
      approval_date: site.approval_date || '',
      notes: site.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveSite = async () => {
    try {
      setIsLoading(true);
      
      // 필수 필드 검증
      if (!editData.name?.trim() || !editData.address?.trim()) {
        alert('현장명과 주소는 필수 입력 항목입니다.');
        return;
      }

      await updateSite(site.id, editData);
      setIsEditing(false);
      setEditData({});
      alert('현장 정보가 수정되었습니다.');
    } catch (error) {
      console.error('현장 정보 수정 에러:', error);
      alert(`현장 정보 수정 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <motion.div
          className="sticky top-0 bg-white shadow-sm z-40 px-4 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/sites')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
              <span className="font-medium">목록</span>
            </button>

            <div className="flex space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEditSite}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    <span>편집</span>
                  </button>
                  <button
                    onClick={() => navigate(`/create-inspection?siteId=${site.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>점검하기</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                    <span>취소</span>
                  </button>
                  <button
                    onClick={handleSaveSite}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                    <span>{isLoading ? '저장중...' : '저장'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="p-4 space-y-4">
          {/* 현장 기본 정보 카드 */}
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <SafeIcon icon={FiMapPin} className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                {!isEditing ? (
                  <>
                    <h1 className="text-xl font-bold text-gray-900">{site.name}</h1>
                    <p className="text-sm text-gray-500">현장 정보</p>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                      placeholder="현장명 *"
                    />
                    <p className="text-sm text-gray-500 mt-1">현장 정보 편집</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">기본 정보</h3>
                
                {/* 주소 */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">주소 *</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-medium">{site.address}</p>
                  ) : (
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="현장 주소"
                    />
                  )}
                </div>

                {/* 전화번호 */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">전화번호</p>
                  {!isEditing ? (
                    <p className="text-gray-900">{site.phone || '-'}</p>
                  ) : (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="02-1234-5678"
                    />
                  )}
                </div>

                {/* 사용승인일 */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">사용승인일</p>
                  {!isEditing ? (
                    <p className="text-gray-900">
                      {site.approval_date ? new Date(site.approval_date).toLocaleDateString('ko-KR') : '-'}
                    </p>
                  ) : (
                    <input
                      type="date"
                      value={editData.approval_date}
                      onChange={(e) => handleInputChange('approval_date', e.target.value)}
                      className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* 소방안전관리자 정보 */}
              <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-red-800">소방안전관리자</h3>
                </div>

                {/* 관리자 이름 */}
                <div>
                  <p className="text-xs text-red-600 mb-1">이름</p>
                  {!isEditing ? (
                    <p className="text-red-900">{site.manager_name || '-'}</p>
                  ) : (
                    <input
                      type="text"
                      value={editData.manager_name}
                      onChange={(e) => handleInputChange('manager_name', e.target.value)}
                      className="w-full text-red-900 bg-white border border-red-200 rounded-lg px-3 py-2 focus:border-red-400 focus:outline-none"
                      placeholder="소방안전관리자 이름"
                    />
                  )}
                </div>

                {/* 관리자 전화번호 */}
                <div>
                  <p className="text-xs text-red-600 mb-1">전화번호</p>
                  {!isEditing ? (
                    <p className="text-red-900">{site.manager_phone || '-'}</p>
                  ) : (
                    <input
                      type="tel"
                      value={editData.manager_phone}
                      onChange={(e) => handleInputChange('manager_phone', e.target.value)}
                      className="w-full text-red-900 bg-white border border-red-200 rounded-lg px-3 py-2 focus:border-red-400 focus:outline-none"
                      placeholder="010-1234-5678"
                    />
                  )}
                </div>

                {/* 관리자 이메일 */}
                <div>
                  <p className="text-xs text-red-600 mb-1">이메일</p>
                  {!isEditing ? (
                    <p className="text-red-900">{site.manager_email || '-'}</p>
                  ) : (
                    <input
                      type="email"
                      value={editData.manager_email}
                      onChange={(e) => handleInputChange('manager_email', e.target.value)}
                      className="w-full text-red-900 bg-white border border-red-200 rounded-lg px-3 py-2 focus:border-red-400 focus:outline-none"
                      placeholder="manager@example.com"
                    />
                  )}
                </div>
              </div>

              {/* 특이사항 */}
              {(site.notes || isEditing) && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiFileText} className="w-4 h-4 text-yellow-600" />
                    <h3 className="text-sm font-semibold text-yellow-800">특이사항</h3>
                  </div>
                  {!isEditing ? (
                    <p className="text-yellow-900 text-sm">{site.notes}</p>
                  ) : (
                    <textarea
                      value={editData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full text-yellow-900 bg-white border border-yellow-200 rounded-lg px-3 py-2 focus:border-yellow-400 focus:outline-none resize-none text-sm"
                      rows={3}
                      placeholder="현장 관련 특이사항을 입력하세요"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">총 점검 기록</span>
              <span className="font-semibold text-blue-600">{inspections.length}건</span>
            </div>
          </motion.div>

          {/* 점검 기록 카드 */}
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">점검 기록</h2>
                <p className="text-sm text-gray-500">최근 점검 내역</p>
              </div>
            </div>

            <AnimatePresence>
              {inspections.length === 0 ? (
                <motion.div
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">아직 점검 기록이 없습니다</p>
                  <p className="text-xs text-gray-400 mt-1">첫 번째 점검을 시작해보세요</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {inspections.map((inspection, index) => (
                    <motion.div
                      key={inspection.id}
                      className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      onClick={() => handleViewInspection(inspection)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {inspection.inspection_type}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiUser} className="w-3 h-3" />
                              <span>{inspection.inspector}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                              <span>{formatDateShort(inspection.created_at)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiFileText} className="w-3 h-3" />
                              <span>지적사항 {(inspection.issues || []).length}건</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleDeleteInspection(inspection.id, e)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="점검 삭제"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                          <SafeIcon icon={FiEye} className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SiteDetail;
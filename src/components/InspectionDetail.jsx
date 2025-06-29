import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import IssueForm from './IssueForm';
import ReportModal from './ReportModal';
import { useInspection } from '../context/InspectionContext';
import { formatDateOnly } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiFileText, FiMapPin, FiUser, FiCalendar, FiPlus, FiEdit2, FiClipboard, FiEdit, FiSave, FiX } = FiIcons;

function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, sites, addIssueToInspection, updateIssue, deleteIssue, updateInspection, facilityOrder } = useInspection();
  
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [isEditingInspection, setIsEditingInspection] = useState(false);
  const [editInspectionData, setEditInspectionData] = useState({});

  const inspection = inspections.find(p => p.id === id);
  const site = inspection?.site || sites.find(s => s.id === inspection?.site_id);

  // 설비별 지적사항 그룹핑 및 정렬 (useMemo로 최적화) - 상세위치 콤마 구분
  const { groupedIssues, sortedFacilities } = useMemo(() => {
    if (!inspection?.issues) return { groupedIssues: {}, sortedFacilities: [] };

    const grouped = inspection.issues.reduce((acc, issue) => {
      if (!acc[issue.facility_type]) {
        acc[issue.facility_type] = {};
      }
      
      const key = `${issue.description}_${issue.location}`;
      if (!acc[issue.facility_type][key]) {
        acc[issue.facility_type][key] = {
          description: issue.description,
          location: issue.location,
          detailLocations: [],
          issues: [] // 개별 이슈들을 저장하여 편집/삭제 가능하게 함
        };
      }

      // 상세위치가 있고 중복되지 않는 경우만 추가
      if (issue.detail_location && issue.detail_location.trim()) {
        const trimmedDetailLocation = issue.detail_location.trim();
        if (!acc[issue.facility_type][key].detailLocations.includes(trimmedDetailLocation)) {
          acc[issue.facility_type][key].detailLocations.push(trimmedDetailLocation);
        }
      }

      // 개별 이슈 저장 (편집/삭제용)
      acc[issue.facility_type][key].issues.push(issue);
      return acc;
    }, {});

    const sorted = Object.keys(grouped).sort((a, b) => {
      return (facilityOrder[a] || 99) - (facilityOrder[b] || 99);
    });

    return { groupedIssues: grouped, sortedFacilities: sorted };
  }, [inspection?.issues, facilityOrder]);

  if (!inspection || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <SafeIcon icon={FiFileText} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">점검을 찾을 수 없습니다.</p>
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

  const handleAddIssue = async (issue) => {
    try {
      await addIssueToInspection(inspection.id, issue);
      setShowIssueForm(false);
    } catch (error) {
      alert('지적사항 추가 중 오류가 발생했습니다.');
    }
  };

  const handleEditIssue = async (issueData) => {
    try {
      await updateIssue(editingIssue.id, issueData);
      setEditingIssue(null);
      setShowIssueForm(false);
    } catch (error) {
      alert('지적사항 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('이 지적사항을 삭제하시겠습니까?')) {
      try {
        await deleteIssue(inspection.id, issueId);
      } catch (error) {
        alert('지적사항 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditInspection = () => {
    setEditInspectionData({
      inspector: inspection.inspector,
      inspection_type: inspection.inspection_type,
      notes: inspection.notes || ''
    });
    setIsEditingInspection(true);
  };

  const handleSaveInspection = async () => {
    try {
      await updateInspection(inspection.id, editInspectionData);
      setIsEditingInspection(false);
    } catch (error) {
      alert('점검 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEditInspection = () => {
    setIsEditingInspection(false);
    setEditInspectionData({});
  };

  const handleEditClick = (issue) => {
    setEditingIssue(issue);
    setShowIssueForm(true);
  };

  const handleCancelForm = () => {
    setShowIssueForm(false);
    setEditingIssue(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
              onClick={() => navigate(`/site/${inspection.site_id}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
              <span className="font-medium">현장</span>
            </button>

            <div className="flex space-x-2">
              {!isEditingInspection ? (
                <>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                  >
                    <SafeIcon icon={FiClipboard} className="w-4 h-4" />
                    <span>보고서</span>
                  </button>
                  <button
                    onClick={handleEditInspection}
                    className="p-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
                  >
                    <SafeIcon icon={FiEdit2} className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEditInspection}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                    <span>취소</span>
                  </button>
                  <button
                    onClick={handleSaveInspection}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
                  >
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                    <span>저장</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="p-4 space-y-4">
          {/* 점검 정보 카드 */}
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{site.name}</h1>
                  <p className="text-sm text-gray-500">점검 상세</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">현장 주소</p>
                  <p className="text-sm font-medium text-gray-900">{site.address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">점검자</p>
                  {!isEditingInspection ? (
                    <p className="text-sm font-medium text-gray-900">{inspection.inspector}</p>
                  ) : (
                    <input
                      type="text"
                      value={editInspectionData.inspector}
                      onChange={(e) => setEditInspectionData(prev => ({ ...prev, inspector: e.target.value }))}
                      className="text-sm font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">점검일시</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateOnly(inspection.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">점검 유형</p>
                  {!isEditingInspection ? (
                    <p className="text-sm font-medium text-gray-900">{inspection.inspection_type}</p>
                  ) : (
                    <select
                      value={editInspectionData.inspection_type}
                      onChange={(e) => setEditInspectionData(prev => ({ ...prev, inspection_type: e.target.value }))}
                      className="text-sm font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="작동점검">작동점검</option>
                      <option value="종합점검">종합점검</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {(inspection.notes || isEditingInspection) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">특이사항</p>
                {!isEditingInspection ? (
                  <p className="text-sm text-gray-900">{inspection.notes}</p>
                ) : (
                  <textarea
                    value={editInspectionData.notes}
                    onChange={(e) => setEditInspectionData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="특이사항을 입력하세요"
                  />
                )}
              </div>
            )}
          </motion.div>

          {/* 지적사항 섹션 */}
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">지적사항</h2>
                <p className="text-sm text-gray-500">총 {(inspection.issues || []).length}건</p>
              </div>
              <motion.button
                onClick={() => setShowIssueForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>추가</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {(inspection.issues || []).length === 0 ? (
                <motion.div
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SafeIcon icon={FiPlus} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">아직 지적사항이 없습니다</p>
                  <p className="text-xs text-gray-400 mt-1">지적사항을 추가해주세요</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {sortedFacilities.map((facilityType) => (
                    <div key={facilityType} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{facilityType}</h3>
                      <div className="space-y-3">
                        {Object.values(groupedIssues[facilityType]).map((groupedIssue, index) => {
                          // 위치와 상세위치 형식: "101동 2계단 3층, 지하1층"
                          let locationText = groupedIssue.location;
                          if (groupedIssue.detailLocations.length > 0) {
                            locationText += ` ${groupedIssue.detailLocations.join(', ')}`;
                          }

                          return (
                            <motion.div
                              key={`${groupedIssue.description}_${groupedIssue.location}`}
                              className="bg-white rounded-lg p-4 border border-gray-100"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2, delay: index * 0.1 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      #{index + 1}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 mb-2">{groupedIssue.description}</p>
                                  <div className="text-xs text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <SafeIcon icon={FiMapPin} className="w-3 h-3" />
                                      <span>{locationText}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {/* 첫 번째 이슈로 편집 */}
                                  <button
                                    onClick={() => handleEditClick(groupedIssue.issues[0])}
                                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                    title="수정"
                                  >
                                    <SafeIcon icon={FiEdit} className="w-4 h-4" />
                                  </button>
                                  {/* 첫 번째 이슈 삭제 (그룹 전체 삭제가 아님) */}
                                  <button
                                    onClick={() => handleDeleteIssue(groupedIssue.issues[0].id)}
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                                    title="삭제"
                                  >
                                    <SafeIcon icon={FiIcons.FiX} className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 지적사항 추가/수정 모달 */}
      <AnimatePresence>
        {showIssueForm && (
          <IssueForm
            onSubmit={editingIssue ? handleEditIssue : handleAddIssue}
            onCancel={handleCancelForm}
            editingIssue={editingIssue}
          />
        )}
      </AnimatePresence>

      {/* 보고서 모달 */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            inspection={inspection}
            site={site}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default InspectionDetail;
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import IssueForm from './IssueForm';
import ReportModal from './ReportModal';
import ImprovedHeader from './ImprovedHeader';
import { useInspection } from '../context/InspectionContext';
import { formatDateOnly } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';

const { 
  FiArrowLeft, FiFileText, FiMapPin, FiUser, FiCalendar, FiPlus, 
  FiEdit2, FiClipboard, FiEdit, FiSave, FiX, FiMoreVertical,
  FiShare, FiTrash2, FiEye, FiChevronDown, FiChevronUp
} = FiIcons;

function ImprovedInspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, sites, addIssueToInspection, updateIssue, deleteIssue, updateInspection, facilityOrder } = useInspection();
  
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [isEditingInspection, setIsEditingInspection] = useState(false);
  const [editInspectionData, setEditInspectionData] = useState({});
  const [expandedSections, setExpandedSections] = useState(new Set());

  const inspection = inspections.find(p => p.id === id);
  const site = inspection?.site || sites.find(s => s.id === inspection?.site_id);

  // 설비별 지적사항 그룹핑
  const { groupedIssues, sortedFacilities, totalIssues } = useMemo(() => {
    if (!inspection?.issues) return { groupedIssues: {}, sortedFacilities: [], totalIssues: 0 };

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
          issues: []
        };
      }

      if (issue.detail_location && issue.detail_location.trim()) {
        const trimmedDetailLocation = issue.detail_location.trim();
        if (!acc[issue.facility_type][key].detailLocations.includes(trimmedDetailLocation)) {
          acc[issue.facility_type][key].detailLocations.push(trimmedDetailLocation);
        }
      }

      acc[issue.facility_type][key].issues.push(issue);
      return acc;
    }, {});

    const sorted = Object.keys(grouped).sort((a, b) => {
      return (facilityOrder[a] || 99) - (facilityOrder[b] || 99);
    });

    // 기본적으로 모든 섹션 펼치기
    setExpandedSections(new Set(sorted));

    return { 
      groupedIssues: grouped, 
      sortedFacilities: sorted,
      totalIssues: inspection.issues.length
    };
  }, [inspection?.issues, facilityOrder]);

  if (!inspection || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <SafeIcon icon={FiFileText} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">점검을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/sites')}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
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

  const toggleSection = (facilityType) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(facilityType)) {
        newSet.delete(facilityType);
      } else {
        newSet.add(facilityType);
      }
      return newSet;
    });
  };

  const getFacilityColor = (facilityType) => {
    const colors = {
      '소화설비': 'bg-red-50 border-red-200 text-red-700',
      '경보설비': 'bg-orange-50 border-orange-200 text-orange-700',
      '피난구조설비': 'bg-blue-50 border-blue-200 text-blue-700',
      '소화용수설비': 'bg-cyan-50 border-cyan-200 text-cyan-700',
      '소화활동설비': 'bg-purple-50 border-purple-200 text-purple-700',
      '안전시설등': 'bg-green-50 border-green-200 text-green-700',
      '권고사항': 'bg-amber-50 border-amber-200 text-amber-700',
      '기타': 'bg-gray-50 border-gray-200 text-gray-700'
    };
    return colors[facilityType] || colors['기타'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 개선된 헤더 */}
      <ImprovedHeader
        title={site.name}
        subtitle={`${totalIssues}건 지적사항`}
        compact={true}
        onMenuClick={() => navigate(`/site/${inspection.site_id}`)}
        onAddClick={() => setShowReportModal(true)}
        showAdd={true}
      />

      <div className="max-w-md mx-auto">
        {/* 점검 요약 카드 */}
        <motion.div
          className="m-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{inspection.inspection_type}</h1>
                <p className="text-red-100 text-sm">{formatDateOnly(inspection.created_at)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
            >
              <SafeIcon icon={FiShare} className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold">{totalIssues}</div>
              <div className="text-red-100 text-sm">총 지적사항</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold">{sortedFacilities.length}</div>
              <div className="text-red-100 text-sm">설비 유형</div>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex items-center text-red-100">
              <SafeIcon icon={FiUser} className="w-4 h-4 mr-2" />
              점검자: {inspection.inspector}
            </div>
            <div className="flex items-center text-red-100">
              <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
              {site.address}
            </div>
          </div>
        </motion.div>

        {/* 지적사항 목록 */}
        <div className="px-4 pb-20">
          {/* 빠른 추가 버튼 */}
          <motion.button
            onClick={() => setShowIssueForm(true)}
            className="w-full mb-4 py-4 bg-white border-2 border-dashed border-red-200 rounded-2xl text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center justify-center space-x-2"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            <span className="font-medium">지적사항 추가</span>
          </motion.button>

          {/* 설비별 지적사항 */}
          <AnimatePresence>
            {sortedFacilities.length === 0 ? (
              <motion.div
                className="text-center py-12 bg-white rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">아직 지적사항이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">위의 버튼을 눌러 추가해보세요</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {sortedFacilities.map((facilityType, sectionIndex) => {
                  const facilityIssues = Object.values(groupedIssues[facilityType]);
                  const isExpanded = expandedSections.has(facilityType);
                  
                  return (
                    <motion.div
                      key={facilityType}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
                    >
                      {/* 섹션 헤더 */}
                      <button
                        onClick={() => toggleSection(facilityType)}
                        className={`w-full p-4 border-l-4 ${getFacilityColor(facilityType)} hover:bg-opacity-50 transition-colors duration-200 flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold">{facilityType}</div>
                          <span className="px-2 py-1 bg-white/50 rounded-full text-xs font-medium">
                            {facilityIssues.length}건
                          </span>
                        </div>
                        <SafeIcon 
                          icon={isExpanded ? FiChevronUp : FiChevronDown} 
                          className="w-5 h-5" 
                        />
                      </button>

                      {/* 지적사항 목록 */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            {facilityIssues.map((groupedIssue, index) => {
                              let locationText = groupedIssue.location;
                              if (groupedIssue.detailLocations.length > 0) {
                                locationText += ` ${groupedIssue.detailLocations.join(', ')}`;
                              }

                              return (
                                <motion.div
                                  key={`${groupedIssue.description}_${groupedIssue.location}`}
                                  className="p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <h4 className="font-medium text-gray-900 mb-2 leading-relaxed">
                                        {groupedIssue.description}
                                      </h4>
                                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                                        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-red-500" />
                                        <span>{locationText}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 ml-3">
                                      <button
                                        onClick={() => {
                                          setEditingIssue(groupedIssue.issues[0]);
                                          setShowIssueForm(true);
                                        }}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                      >
                                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteIssue(groupedIssue.issues[0].id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                      >
                                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 지적사항 추가/수정 모달 */}
      <AnimatePresence>
        {showIssueForm && (
          <IssueForm
            onSubmit={editingIssue ? handleEditIssue : handleAddIssue}
            onCancel={() => {
              setShowIssueForm(false);
              setEditingIssue(null);
            }}
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

export default ImprovedInspectionDetail;
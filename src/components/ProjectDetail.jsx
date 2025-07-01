import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import IssueForm from './IssueForm';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { 
  FiArrowLeft, FiDownload, FiMapPin, FiUser, FiCalendar, FiFileText, 
  FiPlus, FiCheck, FiEdit2, FiX 
} = FiIcons;

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    projects, sites, exportReport, addIssueToProject, deleteIssue, 
    completeProject, reopenProject, facilityOrder 
  } = useInspection();
  const [showIssueForm, setShowIssueForm] = React.useState(false);

  const project = projects.find(p => p.id === id);
  const site = project?.site || sites.find(s => s.id === project?.site_id);

  if (!project || !site) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">프로젝트를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/sites')}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const addIssue = async (issue) => {
    try {
      await addIssueToProject(project.id, issue);
      setShowIssueForm(false);
    } catch (error) {
      alert('지적사항 추가 중 오류가 발생했습니다.');
    }
  };

  const removeIssue = async (issueId) => {
    try {
      await deleteIssue(project.id, issueId);
    } catch (error) {
      alert('지적사항 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCompleteProject = async () => {
    if (window.confirm('점검을 완료 처리하시겠습니까?')) {
      try {
        await completeProject(project.id);
      } catch (error) {
        alert('점검 완료 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleReopenProject = async () => {
    if (window.confirm('완료된 점검을 다시 편집하시겠습니까?')) {
      try {
        await reopenProject(project.id);
      } catch (error) {
        alert('점검 재편집 중 오류가 발생했습니다.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 설비별 지적사항 그룹핑 및 정렬
  const groupedIssues = (project.issues || []).reduce((acc, issue) => {
    if (!acc[issue.facility_type]) {
      acc[issue.facility_type] = [];
    }
    acc[issue.facility_type].push(issue);
    return acc;
  }, {});

  // 설비명 순서대로 정렬
  const sortedFacilities = Object.keys(groupedIssues).sort((a, b) => {
    return (facilityOrder[a] || 99) - (facilityOrder[b] || 99);
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <motion.div
        className="sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/site/${project.site_id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>현장</span>
          </button>
          
          <div className="flex space-x-2">
            {project.status === 'completed' ? (
              <button
                onClick={handleReopenProject}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                <span>편집</span>
              </button>
            ) : (
              <button
                onClick={handleCompleteProject}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                <span>완료</span>
              </button>
            )}
            <button
              onClick={() => exportReport(project)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>내보내기</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* 점검 정보 */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <SafeIcon icon={FiFileText} className="w-6 h-6 mr-2 text-primary-600" />
              {site.name}
            </h1>
            {project.status === 'completed' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" />
                완료됨
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">현장</p>
                <p className="font-medium text-gray-900">{site.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검자</p>
                <p className="font-medium text-gray-900">{project.inspector}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검일시</p>
                <p className="font-medium text-gray-900">{formatDate(project.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiFileText} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검 유형</p>
                <p className="font-medium text-gray-900">{project.inspection_type}</p>
              </div>
            </div>
          </div>

          {project.notes && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">특이사항</p>
              <p className="text-gray-900">{project.notes}</p>
            </div>
          )}
        </motion.div>

        {/* 지적사항 */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              지적사항 ({(project.issues || []).length}건)
            </h2>
            <motion.button
              onClick={() => setShowIssueForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>추가</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {(project.issues || []).length === 0 ? (
              <motion.div
                className="text-center py-8 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SafeIcon icon={FiPlus} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>지적사항을 추가해주세요</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {sortedFacilities.map((facilityType) => (
                  <div key={facilityType} className="border border-gray-100 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{facilityType}</h3>
                    <div className="space-y-3">
                      {groupedIssues[facilityType].map((issue, index) => (
                        <motion.div
                          key={issue.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                              </div>
                              <p className="text-gray-900 mb-2 font-medium">{issue.description}</p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <SafeIcon icon={FiMapPin} className="w-3 h-3 inline mr-1" />
                                  위치: {issue.location}{issue.detail_location && ` - ${issue.detail_location}`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeIssue(issue.id)}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                            >
                              <SafeIcon icon={FiX} className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 지적사항 추가 모달 */}
      <AnimatePresence>
        {showIssueForm && (
          <IssueForm
            onSubmit={addIssue}
            onCancel={() => setShowIssueForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProjectDetail;
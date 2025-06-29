import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiUser, FiCalendar, FiFileText, FiDownload, FiTrash2, FiEye, FiPlus, FiCheck } = FiIcons;

function ProjectList() {
  const navigate = useNavigate();
  const { projects, deleteProject, exportReport, setCurrentProject } = useInspection();

  const handleViewProject = (project) => {
    setCurrentProject(project);
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('이 프로젝트를 삭제하시겠습니까?')) {
      deleteProject(projectId);
    }
  };

  const handleExportReport = (project, e) => {
    e.stopPropagation();
    exportReport(project);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">점검 프로젝트</h2>
          <p className="text-sm text-gray-600">총 {projects.length}개의 프로젝트</p>
        </div>
        <motion.button
          onClick={() => navigate('/create-project')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>새 프로젝트</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {projects.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SafeIcon icon={FiFileText} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">생성된 프로젝트가 없습니다</h3>
            <p className="text-gray-400 mb-6">첫 번째 점검 프로젝트를 생성해보세요</p>
            <button
              onClick={() => navigate('/create-project')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              프로젝트 생성하기
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleViewProject(project)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">{project.buildingName}</h3>
                      {project.status === 'completed' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <SafeIcon icon={FiCheck} className="w-3 h-3 mr-1" />
                          완료
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {project.address}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <SafeIcon icon={FiUser} className="w-3 h-3 mr-1" />
                        {project.inspector}
                      </span>
                      <span className="flex items-center">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleExportReport(project, e)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="보고서 내보내기"
                    >
                      <SafeIcon icon={FiDownload} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="프로젝트 삭제"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">지적사항 {project.issues.length}건</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {project.inspectionType}
                    </div>
                  </div>
                  <SafeIcon icon={FiEye} className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProjectList;
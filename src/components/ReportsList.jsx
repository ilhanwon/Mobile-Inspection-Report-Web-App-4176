import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiUser, FiCalendar, FiFileText, FiDownload, FiTrash2, FiEye, FiAlertTriangle } = FiIcons;

function ReportsList() {
  const navigate = useNavigate();
  const { reports, deleteReport, exportReport } = useInspection();

  const handleViewReport = (report) => {
    navigate(`/report/${report.id}`);
  };

  const handleDeleteReport = (reportId, e) => {
    e.stopPropagation();
    if (window.confirm('이 보고서를 삭제하시겠습니까?')) {
      deleteReport(reportId);
    }
  };

  const handleExportReport = (report, e) => {
    e.stopPropagation();
    exportReport(report);
  };

  const getSeverityStats = (issues) => {
    return {
      high: issues.filter(issue => issue.severity === 'high').length,
      medium: issues.filter(issue => issue.severity === 'medium').length,
      low: issues.filter(issue => issue.severity === 'low').length,
    };
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
          <h2 className="text-xl font-bold text-gray-900">점검 보고서</h2>
          <p className="text-sm text-gray-600">총 {reports.length}개의 보고서</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {reports.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SafeIcon icon={FiFileText} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">작성된 보고서가 없습니다</h3>
            <p className="text-gray-400 mb-6">첫 번째 점검 보고서를 작성해보세요</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              보고서 작성하기
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => {
              const stats = getSeverityStats(report.issues);
              return (
                <motion.div
                  key={report.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleViewReport(report)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">{report.location}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <SafeIcon icon={FiUser} className="w-3 h-3 mr-1" />
                          {report.inspector}
                        </span>
                        <span className="flex items-center">
                          <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleExportReport(report, e)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="보고서 내보내기"
                      >
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteReport(report.id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="보고서 삭제"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">총 {report.issues.length}건</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {stats.high > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            긴급 {stats.high}
                          </span>
                        )}
                        {stats.medium > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            중요 {stats.medium}
                          </span>
                        )}
                        {stats.low > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            일반 {stats.low}
                          </span>
                        )}
                      </div>
                    </div>
                    <SafeIcon icon={FiEye} className="w-4 h-4 text-gray-400" />
                  </div>

                  {report.inspectionType && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {report.inspectionType}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReportsList;
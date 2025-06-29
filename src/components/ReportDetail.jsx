import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiDownload, FiMapPin, FiUser, FiCalendar, FiFileText, FiAlertTriangle, FiTool, FiClock } = FiIcons;

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, exportReport } = useInspection();
  
  const report = reports.find(r => r.id === id);

  if (!report) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">보고서를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/reports')}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityText = (severity) => {
    const texts = { high: '긴급', medium: '중요', low: '일반' };
    return texts[severity] || '일반';
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

  const getSeverityStats = (issues) => {
    return {
      high: issues.filter(issue => issue.severity === 'high').length,
      medium: issues.filter(issue => issue.severity === 'medium').length,
      low: issues.filter(issue => issue.severity === 'low').length,
    };
  };

  const stats = getSeverityStats(report.issues);

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
            onClick={() => navigate('/reports')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>목록</span>
          </button>
          <button
            onClick={() => exportReport(report)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>내보내기</span>
          </button>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {/* 기본 정보 */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiFileText} className="w-6 h-6 mr-2 text-primary-600" />
            점검 보고서
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검 장소</p>
                <p className="font-medium text-gray-900">{report.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검자</p>
                <p className="font-medium text-gray-900">{report.inspector}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검일시</p>
                <p className="font-medium text-gray-900">{formatDate(report.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiFileText} className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">점검 유형</p>
                <p className="font-medium text-gray-900">{report.inspectionType}</p>
              </div>
            </div>
          </div>

          {report.notes && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">특이사항</p>
              <p className="text-gray-900">{report.notes}</p>
            </div>
          )}
        </motion.div>

        {/* 요약 통계 */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">지적사항 요약</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{report.issues.length}</div>
              <div className="text-sm text-gray-600">총 건수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.high}</div>
              <div className="text-sm text-gray-600">긴급</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-sm text-gray-600">중요</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.low}</div>
              <div className="text-sm text-gray-600">일반</div>
            </div>
          </div>
        </motion.div>

        {/* 지적사항 목록 */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">지적사항 상세</h2>
          <div className="space-y-4">
            {report.issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                      {getSeverityText(issue.severity)}
                    </span>
                    <span className="text-sm text-gray-600">{issue.category}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-900 font-medium">{issue.description}</p>
                  </div>

                  {issue.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                      <span>위치: {issue.location}</span>
                    </div>
                  )}

                  {issue.action && (
                    <div className="flex items-start space-x-2 text-sm">
                      <SafeIcon icon={FiTool} className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <span className="text-blue-600 font-medium">조치사항:</span>
                        <p className="text-gray-700">{issue.action}</p>
                      </div>
                    </div>
                  )}

                  {issue.deadline && (
                    <div className="flex items-center space-x-2 text-sm text-orange-600">
                      <SafeIcon icon={FiClock} className="w-4 h-4" />
                      <span>완료기한: {new Date(issue.deadline).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}

                  {issue.photos && issue.photos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">첨부사진 ({issue.photos.length}장)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {issue.photos.map((photo, photoIndex) => (
                          <img
                            key={photoIndex}
                            src={photo}
                            alt={`지적사항 사진 ${photoIndex + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ReportDetail;
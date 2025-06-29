import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import { generatePDF } from '../utils/pdfUtils';
import { formatDateOnly } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiDownload, FiShare, FiFileText } = FiIcons;

function ReportModal({ inspection, site, onClose }) {
  const { generateReportContent, facilityOrder } = useInspection();

  const handleExportPDF = () => {
    try {
      generatePDF(inspection, site);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const handleExportText = () => {
    const reportContent = generateReportContent(inspection, site);
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `소방시설_점검보고서_${site?.name || 'Unknown'}_${new Date(inspection.created_at).toLocaleDateString('ko-KR').replace(/\./g, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const reportContent = generateReportContent(inspection, site);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `소방시설 점검보고서 - ${site.name}`,
          text: reportContent,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      try {
        await navigator.clipboard.writeText(reportContent);
        alert('보고서가 클립보드에 복사되었습니다.');
      } catch (error) {
        alert('클립보드 복사에 실패했습니다.');
      }
    }
  };

  // 설비별 지적사항 그룹핑 및 정렬 - 상세위치 콤마 구분
  const groupedIssues = (inspection.issues || []).reduce((acc, issue) => {
    if (!acc[issue.facility_type]) {
      acc[issue.facility_type] = {};
    }

    const key = `${issue.description}_${issue.location}`;
    if (!acc[issue.facility_type][key]) {
      acc[issue.facility_type][key] = {
        description: issue.description,
        location: issue.location,
        detailLocations: []
      };
    }

    // 상세위치가 있고 중복되지 않는 경우만 추가
    if (issue.detail_location && issue.detail_location.trim()) {
      const trimmedDetailLocation = issue.detail_location.trim();
      if (!acc[issue.facility_type][key].detailLocations.includes(trimmedDetailLocation)) {
        acc[issue.facility_type][key].detailLocations.push(trimmedDetailLocation);
      }
    }

    return acc;
  }, {});

  const sortedFacilities = Object.keys(groupedIssues).sort((a, b) => {
    return (facilityOrder[a] || 99) - (facilityOrder[b] || 99);
  });

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <SafeIcon icon={FiFileText} className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">점검 보고서</h3>
                <p className="text-sm text-gray-500">{site.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="overflow-y-auto max-h-[60vh] px-6 py-4">
          {/* 간소화된 기본 정보 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">{site.name}</h2>
              <p className="text-sm text-gray-600">
                점검일: {formatDateOnly(inspection.created_at)}
              </p>
            </div>
          </div>

          {/* 지적사항 상세 */}
          {sortedFacilities.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">지적사항 상세</h4>
              {sortedFacilities.map(facilityType => {
                const facilityIssues = Object.values(groupedIssues[facilityType]);
                return (
                  <div key={facilityType} className="border border-gray-200 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-3">{facilityType}</h5>
                    <div className="space-y-2">
                      {facilityIssues.map((issue, index) => {
                        let locationText = issue.location;
                        
                        // 상세위치들을 콤마로 구분하여 연결
                        if (issue.detailLocations.length > 0) {
                          locationText += ` (${issue.detailLocations.join(', ')})`;
                        }

                        return (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-900 mb-1">
                              {index + 1}. {issue.description}
                            </div>
                            <div className="text-gray-600 ml-4">
                              위치: {locationText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 특이사항 (있을 경우에만 표시) */}
          {(inspection.notes || site.notes) && (
            <div className="mt-4 bg-yellow-50 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">특이사항</h4>
              {inspection.notes && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-yellow-800">점검 특이사항:</span>
                  <p className="text-sm text-yellow-800">{inspection.notes}</p>
                </div>
              )}
              {site.notes && (
                <div>
                  <span className="text-sm font-medium text-yellow-800">현장 특이사항:</span>
                  <p className="text-sm text-yellow-800">{site.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              <SafeIcon icon={FiShare} className="w-4 h-4" />
              <span>공유</span>
            </button>
            <button
              onClick={handleExportText}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>텍스트</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ReportModal;
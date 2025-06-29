import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import IssueForm from './IssueForm';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiUser, FiCalendar, FiFileText, FiPlus, FiSave, FiCheck } = FiIcons;

function InspectionForm() {
  const navigate = useNavigate();
  const { addReport } = useInspection();
  
  const [formData, setFormData] = useState({
    location: '',
    inspector: '',
    inspectionType: '정기점검',
    notes: '',
  });
  
  const [issues, setIssues] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inspectionTypes = ['정기점검', '특별점검', '안전점검', '시설점검', '환경점검'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIssue = (issue) => {
    setIssues(prev => [...prev, { ...issue, id: Date.now() }]);
    setShowIssueForm(false);
  };

  const removeIssue = (issueId) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleSubmit = async () => {
    if (!formData.location || !formData.inspector || issues.length === 0) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 저장 시뮬레이션
      
      addReport({
        ...formData,
        issues,
      });

      // 폼 초기화
      setFormData({
        location: '',
        inspector: '',
        inspectionType: '정기점검',
        notes: '',
      });
      setIssues([]);

      // 성공 피드백
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* 기본 정보 */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2 text-primary-600" />
          기본 정보
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1 text-gray-500" />
              점검 장소 *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="점검 장소를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-1 text-gray-500" />
              점검자 *
            </label>
            <input
              type="text"
              value={formData.inspector}
              onChange={(e) => handleInputChange('inspector', e.target.value)}
              placeholder="점검자 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1 text-gray-500" />
              점검 유형
            </label>
            <select
              value={formData.inspectionType}
              onChange={(e) => handleInputChange('inspectionType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              {inspectionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특이사항
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="특이사항이 있다면 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>
        </div>
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
            지적사항 ({issues.length})
          </h2>
          <motion.button
            onClick={() => setShowIssueForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span className="font-medium">추가</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {issues.length === 0 ? (
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
            <div className="space-y-3">
              {issues.map((issue, index) => (
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                          {getSeverityText(issue.severity)}
                        </span>
                        <span className="text-sm text-gray-600">{issue.category}</span>
                      </div>
                      <p className="text-gray-900 mb-2">{issue.description}</p>
                      {issue.location && (
                        <p className="text-sm text-gray-600 mb-1">
                          <SafeIcon icon={FiMapPin} className="w-3 h-3 inline mr-1" />
                          {issue.location}
                        </p>
                      )}
                      {issue.action && (
                        <p className="text-sm text-blue-600">조치사항: {issue.action}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeIssue(issue.id)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <SafeIcon icon={FiIcons.FiX} className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 저장 버튼 */}
      <motion.div
        className="sticky bottom-20 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.location || !formData.inspector || issues.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
            isSubmitting
              ? 'bg-green-500'
              : formData.location && formData.inspector && issues.length > 0
              ? 'bg-primary-500 hover:bg-primary-600 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isSubmitting ? (
              <>
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
                <span>저장 완료!</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5" />
                <span>보고서 저장</span>
              </>
            )}
          </div>
        </button>
      </motion.div>

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

export default InspectionForm;
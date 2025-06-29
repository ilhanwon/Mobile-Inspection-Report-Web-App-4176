import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiCheckCircle, FiArrowLeft, FiMapPin } = FiIcons;

function CreateInspection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  
  const { sites, createInspection } = useInspection();
  
  const [formData, setFormData] = useState({
    siteId: siteId || '',
    inspector: '',
    inspectionType: '작동점검',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const inspectionTypes = ['작동점검', '종합점검'];

  const selectedSite = sites.find(s => s.id === formData.siteId);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.siteId || !formData.inspector) {
      alert('현장과 점검자를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newInspection = await createInspection(formData);
      setTimeout(() => {
        navigate(`/inspection/${newInspection.id}`);
      }, 1000);
    } catch (error) {
      alert('점검 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 헤더 */}
        <motion.div
          className="flex items-center space-x-3 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => navigate(siteId ? `/site/${siteId}` : '/sites')}
            className="p-2 hover:bg-white rounded-xl transition-colors duration-200 shadow-sm"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">새 점검 시작</h1>
            <p className="text-sm text-gray-500">점검 정보를 입력해주세요</p>
          </div>
        </motion.div>

        {/* 현장 정보 카드 */}
        {selectedSite && (
          <motion.div
            className="bg-blue-50 rounded-2xl p-4 border border-blue-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <SafeIcon icon={FiMapPin} className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">{selectedSite.name}</h3>
                <p className="text-sm text-blue-700">{selectedSite.address}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 입력 폼 */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* 현장 선택 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              점검할 현장 *
            </label>
            <select
              value={formData.siteId}
              onChange={(e) => handleInputChange('siteId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            >
              <option value="">현장을 선택하세요</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          {/* 점검자 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-2 text-gray-500" />
              점검자 *
            </label>
            <input
              type="text"
              value={formData.inspector}
              onChange={(e) => handleInputChange('inspector', e.target.value)}
              placeholder="점검자 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* 점검 유형 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              점검 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              {inspectionTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('inspectionType', type)}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    formData.inspectionType === type
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 특이사항 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              특이사항
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="특이사항이 있다면 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>
        </motion.div>

        {/* 시작 버튼 */}
        <motion.div
          className="sticky bottom-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.siteId || !formData.inspector}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              isSubmitting
                ? 'bg-green-500 text-white shadow-lg'
                : formData.siteId && formData.inspector
                ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <SafeIcon icon={FiCheckCircle} className="w-6 h-6" />
              <span>{isSubmitting ? '점검 시작 중...' : '점검 시작하기'}</span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateInspection;
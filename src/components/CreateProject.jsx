import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiSave, FiArrowLeft } = FiIcons;

function CreateProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  
  const { sites, createProject } = useInspection();
  
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
      const newProject = await createProject(formData);
      setTimeout(() => {
        navigate(`/project/${newProject.id}`);
      }, 1000);
    } catch (error) {
      alert('프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <motion.div
        className="flex items-center space-x-3 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => navigate(siteId ? `/site/${siteId}` : '/sites')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">새 점검 시작</h1>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현장 선택 *
            </label>
            <select
              value={formData.siteId}
              onChange={(e) => handleInputChange('siteId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">현장을 선택하세요</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
              점검 유형 *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {inspectionTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('inspectionType', type)}
                  className={`py-3 px-4 rounded-lg border font-medium transition-all duration-200 ${
                    formData.inspectionType === type
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
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

      <motion.div
        className="sticky bottom-20 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.siteId || !formData.inspector}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
            isSubmitting
              ? 'bg-green-500'
              : formData.siteId && formData.inspector
              ? 'bg-primary-500 hover:bg-primary-600 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <SafeIcon icon={FiSave} className="w-5 h-5" />
            <span>{isSubmitting ? '점검 시작 중...' : '점검 시작'}</span>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

export default CreateProject;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiSave, FiArrowLeft, FiHome, FiPhone, FiUser, FiMail, FiCalendar, FiFileText } = FiIcons;

function CreateSite() {
  const navigate = useNavigate();
  const { createSite } = useInspection();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    approval_date: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      alert('현장명과 주소를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSite(formData);
      navigate('/sites');
    } catch (error) {
      alert('현장 등록 중 오류가 발생했습니다.');
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
            onClick={() => navigate('/sites')}
            className="p-2 hover:bg-white rounded-xl transition-colors duration-200 shadow-sm"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">새 현장 등록</h1>
            <p className="text-sm text-gray-500">현장 정보를 입력해주세요</p>
          </div>
        </motion.div>

        {/* 기본 정보 */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiHome} className="w-5 h-5 mr-2 text-blue-600" />
            기본 정보
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현장명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="현장명을 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1 text-gray-500" />
                주소 *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="현장 주소를 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-1 text-gray-500" />
                현장 전화번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="02-1234-5678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1 text-gray-500" />
                사용승인일
              </label>
              <input
                type="date"
                value={formData.approval_date}
                onChange={(e) => handleInputChange('approval_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </motion.div>

        {/* 소방안전관리자 정보 */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiUser} className="w-5 h-5 mr-2 text-red-600" />
            소방안전관리자
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.manager_name}
                onChange={(e) => handleInputChange('manager_name', e.target.value)}
                placeholder="소방안전관리자 이름"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-1 text-gray-500" />
                전화번호
              </label>
              <input
                type="tel"
                value={formData.manager_phone}
                onChange={(e) => handleInputChange('manager_phone', e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-1 text-gray-500" />
                이메일
              </label>
              <input
                type="email"
                value={formData.manager_email}
                onChange={(e) => handleInputChange('manager_email', e.target.value)}
                placeholder="manager@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </motion.div>

        {/* 특이사항 */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2 text-gray-600" />
            특이사항
          </h2>
          
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="현장 관련 특이사항을 입력하세요"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </motion.div>

        {/* 등록 버튼 */}
        <motion.div
          className="sticky bottom-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.address}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              isSubmitting
                ? 'bg-green-500 text-white shadow-lg'
                : formData.name && formData.address
                ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <SafeIcon icon={FiSave} className="w-6 h-6" />
              <span>{isSubmitting ? '등록 중...' : '현장 등록하기'}</span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateSite;
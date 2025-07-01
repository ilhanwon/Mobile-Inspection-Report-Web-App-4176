import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { useInspection } from '../context/InspectionContext';
import { useToast } from '../hooks/useToast';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMapPin, 
  FiSave, 
  FiArrowLeft, 
  FiHome, 
  FiPhone, 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiFileText 
} = FiIcons;

function CreateSite() {
  const navigate = useNavigate();
  const { createSite } = useInspection();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
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

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 상태 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '현장명을 입력해주세요.';
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    if (formData.manager_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.manager_email)) {
      newErrors.manager_email = '올바른 이메일 형식이 아닙니다.';
    }

    if (formData.phone && !/^[\d-+().\s]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    if (formData.manager_phone && !/^[\d-+().\s]+$/.test(formData.manager_phone)) {
      newErrors.manager_phone = '올바른 전화번호 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      error('입력 정보를 확인해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSite(formData);
      success('현장이 성공적으로 등록되었습니다.');
      navigate('/sites');
    } catch (err) {
      error('현장 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, createSite, navigate, success, error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 기본 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiHome} className="w-5 h-5 mr-2 text-blue-600" />
              기본 정보
            </h2>
            <div className="space-y-4">
              <Input
                label="현장명"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="현장명을 입력하세요"
                required
                error={errors.name}
                disabled={isSubmitting}
              />
              
              <Input
                label="주소"
                icon={FiMapPin}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="현장 주소를 입력하세요"
                required
                error={errors.address}
                disabled={isSubmitting}
              />
              
              <Input
                label="현장 전화번호"
                icon={FiPhone}
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="02-1234-5678"
                error={errors.phone}
                disabled={isSubmitting}
              />
              
              <Input
                label="사용승인일"
                icon={FiCalendar}
                type="date"
                value={formData.approval_date}
                onChange={(e) => handleInputChange('approval_date', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </Card>
        </motion.div>

        {/* 소방안전관리자 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card variant="danger">
            <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <SafeIcon icon={FiUser} className="w-5 h-5 mr-2 text-red-600" />
              소방안전관리자
            </h2>
            <div className="space-y-4">
              <Input
                label="이름"
                value={formData.manager_name}
                onChange={(e) => handleInputChange('manager_name', e.target.value)}
                placeholder="소방안전관리자 이름"
                disabled={isSubmitting}
              />
              
              <Input
                label="전화번호"
                icon={FiPhone}
                type="tel"
                value={formData.manager_phone}
                onChange={(e) => handleInputChange('manager_phone', e.target.value)}
                placeholder="010-1234-5678"
                error={errors.manager_phone}
                disabled={isSubmitting}
              />
              
              <Input
                label="이메일"
                icon={FiMail}
                type="email"
                value={formData.manager_email}
                onChange={(e) => handleInputChange('manager_email', e.target.value)}
                placeholder="manager@example.com"
                error={errors.manager_email}
                disabled={isSubmitting}
              />
            </div>
          </Card>
        </motion.div>

        {/* 특이사항 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
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
              disabled={isSubmitting}
            />
          </Card>
        </motion.div>

        {/* 등록 버튼 */}
        <motion.div
          className="sticky bottom-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.address}
            loading={isSubmitting}
            icon={FiSave}
            variant={isSubmitting ? 'success' : 'primary'}
            size="lg"
            fullWidth
          >
            {isSubmitting ? '등록 중...' : '현장 등록하기'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default React.memo(CreateSite);
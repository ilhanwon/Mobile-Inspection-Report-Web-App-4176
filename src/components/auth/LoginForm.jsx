import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield, FiCheckCircle } = FiIcons;

function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        // 회원가입 로직
        if (!formData.fullName.trim()) {
          setError('이름을 입력해주세요.');
          return;
        }

        if (!formData.email.trim()) {
          setError('이메일을 입력해주세요.');
          return;
        }

        if (!isValidEmail(formData.email.trim())) {
          setError('올바른 이메일 주소를 입력해주세요. (예: user@example.com)');
          return;
        }

        if (formData.password.length < 6) {
          setError('비밀번호는 최소 6자 이상이어야 합니다.');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          return;
        }

        setSuccess('계정을 생성하고 있습니다... 잠시만 기다려주세요.');
        const result = await signUp(formData.email, formData.password, formData.fullName);

        if (result.error) {
          setError(result.error.message);
          setSuccess('');
        } else if (result.needsManualLogin) {
          setSuccess('✅ ' + result.message);
          // 폼을 로그인 모드로 전환하고 이메일/비밀번호 유지
          setTimeout(() => {
            setIsSignUp(false);
            setFormData({
              email: formData.email,
              password: formData.password,
              fullName: '',
              confirmPassword: ''
            });
            setSuccess('이제 로그인 버튼을 클릭해주세요.');
          }, 2000);
        } else if (result.success) {
          setSuccess('🎉 회원가입 완료! 자동으로 로그인되었습니다.');
          // 폼 초기화
          setFormData({
            email: '',
            password: '',
            fullName: '',
            confirmPassword: ''
          });
        }
      } else {
        // 로그인 로직
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('이메일과 비밀번호를 입력해주세요.');
          return;
        }

        if (!isValidEmail(formData.email.trim())) {
          setError('올바른 이메일 주소를 입력해주세요.');
          return;
        }

        const { data, error } = await signIn(formData.email, formData.password);

        if (error) {
          setError(error.message);
        } else {
          setSuccess('로그인 성공! 앱을 준비하고 있습니다...');
          // 성공 시 폼 초기화
          setTimeout(() => {
            setFormData({
              email: '',
              password: '',
              fullName: '',
              confirmPassword: ''
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('인증 오류:', error);
      setError('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
  };

  const switchToLogin = () => {
    setIsSignUp(false);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShield} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">소방시설 점검</h1>
          <p className="text-gray-600">팀 협업 지적사항 관리</p>
        </div>

        {/* 탭 전환 */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={switchToLogin}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              !isSignUp
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={switchToSignUp}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              isSignUp
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 즉시 활성화 안내 */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-800">
              {isSignUp ? '🚀 회원가입 후 즉시 사용 가능합니다!' : '⚡ 즉시 로그인 가능합니다!'}
            </p>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 (회원가입 시에만) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-1" />
                이름 *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required={isSignUp}
                disabled={loading}
              />
            </motion.div>
          )}

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-1" />
              이메일 *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiLock} className="w-4 h-4 inline mr-1" />
              비밀번호 *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="최소 6자 이상"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 (회원가입 시에만) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiLock} className="w-4 h-4 inline mr-1" />
                비밀번호 확인 *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required={isSignUp}
                disabled={loading}
              />
            </motion.div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
            >
              <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2"
            >
              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </motion.div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              loading
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isSignUp ? '계정 생성 중...' : '로그인 중...'}</span>
              </div>
            ) : (
              isSignUp ? '🚀 회원가입' : '로그인'
            )}
          </button>
        </form>

        {/* 데모 계정 안내 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center mb-2">
            <strong>데모 계정으로 즉시 체험:</strong>
          </p>
          <div className="space-y-1 text-xs text-gray-600 text-center">
            <p>📧 demo@fire.com / 🔑 123456</p>
            <p>📧 test@example.com / 🔑 123456</p>
            <p>📧 admin@fire.com / 🔑 123456</p>
          </div>
        </div>

        {/* 회원가입/로그인 전환 링크 */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={isSignUp ? switchToLogin : switchToSignUp}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            disabled={loading}
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인하기' : '계정이 없으신가요? 회원가입하기'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginForm;
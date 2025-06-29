import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlus, FiMail, FiUserCheck, FiX } = FiIcons;

function TeamMembers({ inspectionId, onMembersChange }) {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inspectionId) {
      loadTeamMembers();
      loadAllUsers();
    }
  }, [inspectionId]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('inspection_team_members_fire_v2')
        .select(`
          *,
          user:user_profiles_fire_v2(*)
        `)
        .eq('inspection_id', inspectionId);

      if (error) throw error;
      setTeamMembers(data || []);
      onMembersChange?.(data || []);
    } catch (error) {
      console.error('팀 멤버 로드 오류:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_fire_v2')
        .select('*')
        .neq('id', user?.id); // 현재 사용자 제외

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('사용자 목록 로드 오류:', error);
    }
  };

  const addTeamMember = async (userId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inspection_team_members_fire_v2')
        .insert([{
          inspection_id: inspectionId,
          user_id: userId,
          added_by: user.id
        }]);

      if (error) throw error;
      
      await loadTeamMembers();
      setShowAddModal(false);
    } catch (error) {
      console.error('팀 멤버 추가 오류:', error);
      alert('팀 멤버 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const removeTeamMember = async (memberId) => {
    if (!window.confirm('이 팀 멤버를 제거하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('inspection_team_members_fire_v2')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadTeamMembers();
    } catch (error) {
      console.error('팀 멤버 제거 오류:', error);
      alert('팀 멤버 제거 중 오류가 발생했습니다.');
    }
  };

  const availableUsers = allUsers.filter(user => 
    !teamMembers.some(member => member.user_id === user.id)
  );

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">팀 멤버</h3>
          <span className="text-sm text-gray-500">({teamMembers.length}명)</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>추가</span>
        </button>
      </div>

      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUserCheck} className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{member.user?.full_name}</p>
                <p className="text-xs text-gray-500">{member.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => removeTeamMember(member.id)}
              className="p-1 text-red-500 hover:text-red-700 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {teamMembers.length === 0 && (
          <p className="text-center text-gray-500 py-4 text-sm">
            아직 팀 멤버가 없습니다
          </p>
        )}
      </div>

      {/* 팀 멤버 추가 모달 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">팀 멤버 추가</h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addTeamMember(user.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                    >
                      추가
                    </button>
                  </div>
                ))}
                
                {availableUsers.length === 0 && (
                  <p className="text-center text-gray-500 py-4 text-sm">
                    추가할 수 있는 멤버가 없습니다
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeamMembers;
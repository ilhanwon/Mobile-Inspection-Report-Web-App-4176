import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiSend, FiTrash2, FiEdit } = FiIcons;

function Comments({ inspectionId, issueId = null }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (inspectionId) {
      loadComments();
    }
  }, [inspectionId, issueId]);

  const loadComments = async () => {
    try {
      let query = supabase
        .from('inspection_comments_fire_v2')
        .select(`
          *,
          user:user_profiles_fire_v2(*)
        `)
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: true });

      if (issueId) {
        query = query.eq('issue_id', issueId);
      } else {
        query = query.is('issue_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('댓글 로드 오류:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inspection_comments_fire_v2')
        .insert([{
          inspection_id: inspectionId,
          issue_id: issueId,
          user_id: user.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('댓글 추가 오류:', error);
      alert('댓글 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('inspection_comments_fire_v2')
        .update({ content: editText.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('inspection_comments_fire_v2')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await loadComments();
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <SafeIcon icon={FiMessageCircle} className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">
          {issueId ? '지적사항 댓글' : '점검 댓글'}
        </h3>
        <span className="text-sm text-gray-500">({comments.length}개)</span>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              className="border border-gray-100 rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {comment.user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {comment.user?.full_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                
                {comment.user_id === user?.id && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEdit(comment)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateComment(comment.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4 text-sm">
            아직 댓글이 없습니다
          </p>
        )}
      </div>

      {/* 새 댓글 입력 */}
      <div className="flex space-x-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addComment();
            }
          }}
        />
        <button
          onClick={addComment}
          disabled={loading || !newComment.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center"
        >
          <SafeIcon icon={FiSend} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Comments;
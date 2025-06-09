"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import { useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { useAuthStore } from "@/stores/authStore";

interface CommentItemProps {
  comment: Comment;
  userId: string;
  postId: string;
}

export default function CommentItem({
  comment,
  userId,
  postId,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const { user, isAuthenticated } = useAuthStore();

  // 🔄 댓글 수정/삭제 Mutations
  const updateMutation = useUpdateComment(userId, postId);
  const deleteMutation = useDeleteComment(userId, postId);

  // 👤 현재 사용자가 이 댓글의 작성자인지 확인
  const isAuthor =
    isAuthenticated &&
    user &&
    (user.id === comment.userId || user.userId === comment.user?.userId);

  // 🔄 댓글 수정 처리
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        commentId: comment.id.toString(),
        data: { content: editContent.trim() },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 🗑️ 댓글 삭제 처리
  const handleDelete = async () => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(comment.id.toString());
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 📅 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      {/* 👤 댓글 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-white">
            {comment.user?.username ||
              comment.username ||
              `사용자${comment.userId}`}
          </span>
          <span className="text-sm text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
          {comment.createdAt !== comment.updatedAt && (
            <span className="text-xs text-gray-500">(수정됨)</span>
          )}
        </div>

        {/* 🔧 수정/삭제 버튼 (작성자만) */}
        {isAuthor && (
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={
                    updateMutation.isPending || deleteMutation.isPending
                  }
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  disabled={
                    updateMutation.isPending || deleteMutation.isPending
                  }
                >
                  {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="text-sm text-green-400 hover:text-green-300 transition-colors"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "저장 중..." : "저장"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={updateMutation.isPending}
                >
                  취소
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 💬 댓글 내용 */}
      <div>
        {isEditing ? (
          // 🔄 수정 모드
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            disabled={updateMutation.isPending}
          />
        ) : (
          // 👀 읽기 모드
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}

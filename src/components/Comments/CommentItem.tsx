"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import { useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const router = useRouter();

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

  // 📅 날짜 포맷팅 (시간대 고려)
  const formatDate = (dateString: string) => {
    // 서버에서 오는 시간이 UTC인지 확인하고 로컬 시간으로 변환
    const date = new Date(dateString);
    const now = new Date();

    // 시간대 오프셋 확인 (디버깅용)
    console.log("원본 날짜:", dateString);
    console.log("파싱된 날짜:", date.toString());
    console.log("현재 시간:", now.toString());
    console.log(
      "시간 차이 (분):",
      Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    );

    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <article className="flex items-start gap-4 p-6 bg-black/40 rounded-xl border border-gray-600/40 hover:border-gray-500/50 hover:bg-black/50 transition-all duration-300 mb-4">
      {/* 프로필 이미지 */}
      <div className="flex-shrink-0">
        {comment.user?.profileImage ? (
          <Image
            src={comment.user.profileImage}
            alt={`${comment.user.username || comment.username} 프로필`}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (comment.user?.userId)
                router.push(`/posts/${comment.user.userId}`);
            }}
          />
        ) : (
          <div
            className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-gray-500 transition-colors"
            onClick={() => {
              if (comment.user?.userId)
                router.push(`/posts/${comment.user.userId}`);
            }}
            title={comment.user?.username}
          >
            {(comment.user?.username || comment.username || "U")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* 헤더: 사용자명과 메타 정보 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className="text-gray-200 font-semibold cursor-pointer hover:text-white transition-colors"
              onClick={() => {
                if (comment.user?.userId)
                  router.push(`/posts/${comment.user.userId}`);
              }}
            >
              {comment.user?.username ||
                comment.username ||
                `사용자${comment.userId}`}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <span className="text-xs text-gray-500">(수정됨)</span>
            )}
          </div>

          {/* 수정/삭제 버튼 - 우측 상단 고정 */}
          {isAuthor && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full"
                    disabled={
                      updateMutation.isPending || deleteMutation.isPending
                    }
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full"
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
                    className="text-xs text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "저장 중..." : "저장"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full"
                    disabled={updateMutation.isPending}
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        <div>
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none transition-all"
              rows={3}
              disabled={updateMutation.isPending}
            />
          ) : (
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

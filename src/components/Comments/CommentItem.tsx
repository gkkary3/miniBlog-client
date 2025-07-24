"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import {
  useUpdateComment,
  useDeleteComment,
  useCreateComment,
} from "@/hooks/useComments";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CommentItemProps {
  comment: Comment;
  userId: string;
  postId: string;
  depth?: number; // 🆕 댓글 깊이 (0: 원댓글, 1: 대댓글)
}

export default function CommentItem({
  comment,
  userId,
  postId,
  depth = 0,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  // 🆕 답글이 1개일 때는 기본적으로 보여주기
  const [showReplies, setShowReplies] = useState(
    comment.replies && comment.replies.length === 1
  );

  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // 🔄 댓글 수정/삭제/작성 Mutations
  const updateMutation = useUpdateComment(userId, postId);
  const deleteMutation = useDeleteComment(userId, postId);
  const createMutation = useCreateComment(userId, postId);

  // 👤 현재 사용자가 이 댓글의 작성자인지 확인
  const isAuthor =
    isAuthenticated &&
    user &&
    (user.id === comment.userId || user.userId === comment.user?.userId);

  // 🆕 대댓글 작성 가능 여부 확인 (2단계 깊이 제한)
  const canReply = depth === 0 && isAuthenticated;

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

  // 🆕 대댓글 작성 처리
  const handleReply = async () => {
    if (!replyContent.trim()) {
      alert("대댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        content: replyContent.trim(),
        parentId: comment.id,
      });
      setIsReplying(false);
      setReplyContent("");
      setShowReplies(true); // 🆕 답글 작성 후 바로 보이도록
    } catch (error) {
      console.error("대댓글 작성 실패:", error);
      alert("대댓글 작성에 실패했습니다.");
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
    <div className={`${depth > 0 ? "ml-12" : ""}`}>
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
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:from-blue-400 hover:to-purple-500 transition-all duration-200 transform hover:scale-105"
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
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
              <span
                className="text-gray-200 font-semibold cursor-pointer hover:text-white transition-colors truncate"
                onClick={() => {
                  if (comment.user?.userId)
                    router.push(`/posts/${comment.user.userId}`);
                }}
              >
                {comment.user?.username ||
                  comment.username ||
                  `사용자${comment.userId}`}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatDate(comment.createdAt)}</span>
                {comment.createdAt !== comment.updatedAt && (
                  <span className="text-gray-500">(수정됨)</span>
                )}
              </div>
            </div>

            {/* 수정/삭제 버튼 - 모바일 최적화 */}
            {isAuthor && (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap"
                      disabled={
                        updateMutation.isPending || deleteMutation.isPending
                      }
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap"
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
                      className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "저장 중..." : "저장"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap"
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
          <div className="mb-3">
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

          {/* 🆕 대댓글 작성 버튼 및 답글 더보기 */}
          {!isEditing &&
            (canReply || (comment.replies && comment.replies.length > 0)) && (
              <div className="flex items-center gap-2 mb-3">
                {canReply && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 px-3 py-1 rounded-full transition-all duration-200 transform hover:scale-105"
                    disabled={createMutation.isPending}
                  >
                    {isReplying ? "취소" : "답글"}
                  </button>
                )}

                {/* 답글이 2개 이상일 때만 더보기/숨기기 버튼 표시 */}
                {comment.replies && comment.replies.length >= 2 && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="group text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 px-3 py-1 rounded-full transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-blue-500/30"
                  >
                    <span className="flex items-center gap-1">
                      <span className="transition-transform duration-200 group-hover:rotate-12">
                        {showReplies ? "👆" : "👇"}
                      </span>
                      {showReplies
                        ? "답글 숨기기"
                        : `답글 ${comment.replies.length}개 더보기`}
                    </span>
                  </button>
                )}
              </div>
            )}

          {/* 🆕 대댓글 작성 폼 */}
          {isReplying && (
            <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none transition-all"
                rows={3}
                placeholder="답글을 작성하세요..."
                disabled={createMutation.isPending}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full"
                  disabled={createMutation.isPending}
                >
                  취소
                </button>
                <button
                  onClick={handleReply}
                  className="text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 px-3 py-1 rounded-full transition-all"
                  disabled={createMutation.isPending || !replyContent.trim()}
                >
                  {createMutation.isPending ? "작성 중..." : "답글 작성"}
                </button>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* 🆕 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && showReplies && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              userId={userId}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

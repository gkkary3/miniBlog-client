"use client";

import { useComments } from "@/hooks/useComments";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  userId: string; // 게시글 작성자 ID (예: "Soda")
  postId: string; // 게시글 ID (예: "8")
}

export default function CommentSection({
  userId,
  postId,
}: CommentSectionProps) {
  // 🔍 TanStack Query로 댓글 데이터 가져오기
  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
  } = useComments(userId, postId);

  return (
    <div className="mt-8 border-t border-gray-700 pt-8">
      {/* 📊 댓글 섹션 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          댓글 ({comments.length})
        </h3>
        <button
          onClick={() => refetch()}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          🔄 새로고침
        </button>
      </div>

      {/* ✍️ 댓글 작성 폼 */}
      <div className="mb-8">
        <CommentForm userId={userId} postId={postId} />
      </div>

      {/* 📝 댓글 목록 */}
      <div>
        {isLoading ? (
          // ⏳ 로딩 상태
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">댓글을 불러오는 중...</div>
          </div>
        ) : error ? (
          // ❌ 에러 상태
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">
              댓글을 불러오는데 실패했습니다.
            </div>
            <button
              onClick={() => refetch()}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              다시 시도
            </button>
          </div>
        ) : comments.length === 0 ? (
          // 📭 댓글 없음
          <div className="text-center py-8 text-gray-400">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요! 💬
          </div>
        ) : (
          // 📝 댓글 목록 표시
          <CommentList comments={comments} userId={userId} postId={postId} />
        )}
      </div>
    </div>
  );
}

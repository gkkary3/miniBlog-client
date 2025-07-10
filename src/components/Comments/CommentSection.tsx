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
    <section className="mt-12">
      {/* 댓글 섹션 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            댓글
          </h3>
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-full border border-blue-500/30">
            <span className="text-blue-300 font-medium text-sm">
              {comments.length}
            </span>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="hidden text-sm text-gray-400 hover:text-blue-400 transition-colors px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600/50 hover:border-blue-500/50 hover:bg-gray-800/70"
        >
          ↻ 새로고침
        </button>
      </div>
      {/* 댓글 작성 폼 */}
      <div className="mb-8">
        <CommentForm userId={userId} postId={postId} />
      </div>
      {/* 댓글 목록 */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <div className="text-gray-400 text-sm">댓글을 불러오는 중...</div>
          </div>
        ) : error ? (
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
          <div></div>
        ) : (
          <CommentList comments={comments} userId={userId} postId={postId} />
        )}
      </div>
    </section>
  );
}

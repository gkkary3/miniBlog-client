"use client";

import { useState } from "react";
import { useCreateComment } from "@/hooks/useComments";
import { useAuthStore } from "@/stores/authStore";

interface CommentFormProps {
  userId: string;
  postId: string;
}

export default function CommentForm({ userId, postId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const { isAuthenticated } = useAuthStore();

  // 🔄 댓글 작성 Mutation
  const createMutation = useCreateComment(userId, postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (!isAuthenticated) {
      alert("댓글 작성을 위해 로그인이 필요합니다.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        content: content.trim(),
      });
      setContent(""); // 성공 시 입력 필드 초기화
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-black/40 p-6 rounded-xl border border-gray-600/50 text-center">
        <p className="text-gray-300 mb-4 text-lg">
          댓글을 작성하려면 로그인이 필요합니다
        </p>
        <a
          href={`/login?redirect=${encodeURIComponent(
            window.location.pathname
          )}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-700/50 px-6 py-3 rounded-lg font-medium transition-all"
        >
          로그인하기
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 p-6 rounded-xl border border-gray-600/50"
    >
      {/* 댓글 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요..."
        rows={3}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none transition-all"
        disabled={createMutation.isPending}
        maxLength={500}
      />
      {/* 글자수 & 버튼 */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-400">
          {content.length} / 500 글자
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setContent("")}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            disabled={!content || createMutation.isPending}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={
              !content.trim() ||
              createMutation.isPending ||
              content.length > 500
            }
            className="px-6 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {createMutation.isPending ? "작성 중..." : "댓글 작성"}
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { UserPost } from "@/types/post";

interface PostListProps {
  posts: UserPost[];
  userId: string;
  selectedCategory: string | null;
  loading?: boolean;
  hasMore?: boolean;
  searchQuery?: string;
  lastElementRef?: (node: HTMLElement | null) => void;
}

export default function PostList({
  posts,
  userId,
  selectedCategory,
  loading = false,
  hasMore = false,
  searchQuery = "",
  lastElementRef,
}: PostListProps) {
  const router = useRouter();

  // 선택된 카테고리에 따라 게시물 필터링 (카테고리가 선택된 경우에만)
  const filteredPosts = selectedCategory
    ? posts.filter((post) =>
        post.categories.some((cat) => cat.name === selectedCategory)
      )
    : posts;

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${userId}/${postId}`);
  };

  if (filteredPosts.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">
          {searchQuery
            ? `"${searchQuery}" 검색 결과가 없습니다.`
            : selectedCategory
            ? `"${selectedCategory}" 카테고리에 게시물이 없습니다.`
            : "게시물이 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터링/검색 결과 표시 */}
      {searchQuery && (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <p className="text-blue-300">
            <span className="font-semibold">&ldquo;{searchQuery}&rdquo;</span>{" "}
            검색 결과
            <span className="ml-2 text-blue-400">
              ({filteredPosts.length}개)
            </span>
          </p>
        </div>
      )}

      {selectedCategory && !searchQuery && (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <p className="text-blue-300">
            <span className="font-semibold">#{selectedCategory}</span> 카테고리
            <span className="ml-2 text-blue-400">
              ({filteredPosts.length}개)
            </span>
          </p>
        </div>
      )}

      {filteredPosts.map((post, index) => (
        <article
          key={post.id}
          ref={index === filteredPosts.length - 1 ? lastElementRef : null}
          onClick={() => handlePostClick(post.id)}
          className="bg-black/40 rounded-lg p-3 sm:p-6 hover:bg-black/30 transition-colors cursor-pointer group"
        >
          {/* 썸네일 */}
          {post.thumbnail && (
            <div className="w-full h-32 sm:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden bg-gray-800">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* 카테고리 태그들 */}
          <div className="flex gap-2 mb-4">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category.name
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                #{category.name}
              </span>
            ))}
          </div>

          {/* 게시글 내용 미리보기 */}
          <p className="text-gray-300 mb-4 line-clamp-3">
            {post.content.length > 150
              ? post.content.substring(0, 150) + "..."
              : post.content}
          </p>

          {/* 메타 정보 */}
          <div className="flex justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="text-red-400">❤️</span>
                <span>{post.likeCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-400">💬</span>
                <span>{post.commentCount}</span>
              </span>
            </div>
            <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>

          {/* 클릭 힌트 */}
          <div className="mt-3 text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
            클릭하여 자세히 보기 →
          </div>
        </article>
      ))}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">더 많은 게시글 불러오는 중...</p>
        </div>
      )}

      {/* 더 이상 로드할 항목이 없을 때 */}
      {!hasMore && filteredPosts.length > 0 && !loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <span>🎉</span>
            <span>모든 게시글을 확인했습니다</span>
            <span>🎉</span>
          </div>
        </div>
      )}
    </div>
  );
}

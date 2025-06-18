"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteSearch, SortType } from "../../hooks/useInfiniteSearch";
import { SearchPost } from "../../types/post";

export default function PostsPage() {
  const router = useRouter();

  // 검색 input ref (포커스 유지를 위함)
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    posts,
    loading,
    hasMore,
    error,
    searchInput,
    searchQuery,
    total,
    sortBy,
    setSortBy,
    setSearchInput,
    resetSearch,
    lastElementRef,
  } = useInfiniteSearch(10);

  const handlePostClick = (post: SearchPost) => {
    router.push(`/posts/${post.user.userId}/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    router.push(`/posts/${userId}`);
  };

  // 검색 input 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 검색 중에도 포커스 유지
  useEffect(() => {
    if (
      searchInputRef.current &&
      document.activeElement !== searchInputRef.current
    ) {
      // 검색 중이면서 다른 요소에 포커스가 있을 때만 포커스 복원
      if (searchInput && loading) {
        searchInputRef.current.focus();
      }
    }
  }, [loading, searchInput]);

  return (
    <div className="min-h-screen bg-black/80 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ✨ 모든 블로그 게시글
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            다양한 작성자들의 흥미로운 이야기를 만나보세요
          </p>

          {/* 전체 게시글 개수 표시 (검색 중이 아닐 때만) */}
          {!searchQuery && total > 0 && (
            <p className="text-gray-500 text-sm text-center mb-4">
              총 {total}개의 게시글
            </p>
          )}

          {/* 필터와 검색 컨테이너 (항상 표시) */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {/* 왼쪽: 정렬 필터 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy(SortType.LATEST)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === SortType.LATEST
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy(SortType.LIKES)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === SortType.LIKES
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  좋아요순
                </button>
                <button
                  onClick={() => setSortBy(SortType.COMMENTS)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === SortType.COMMENTS
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  댓글순
                </button>
              </div>

              {/* 오른쪽: 검색 */}
              <div className="hidden md:block">
                <div className="flex gap-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="검색..."
                    className="w-48 px-3 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={resetSearch}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors text-sm"
                      title="검색 초기화"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 검색 결과 정보 */}
          {searchQuery && (
            <div className="text-center mb-8">
              <p className="text-gray-400">
                &ldquo;
                <span className="text-blue-400 font-semibold">
                  {searchQuery}
                </span>
                &rdquo; 검색 결과
                {loading && (
                  <span className="ml-2 text-gray-400">(검색 중...)</span>
                )}
              </p>
              {posts.length > 0 && (
                <p className="text-gray-500 mt-2">
                  {posts.length}개의 결과를 찾았습니다
                </p>
              )}
            </div>
          )}
        </div>

        {/* 모바일 검색 폼 - 게시글 바로 위에 배치 */}
        <div className="md:hidden mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="검색어를 입력하세요..."
                autoFocus
                className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={resetSearch}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                title="검색 초기화"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-400 text-xl mb-2">❌ {error}</div>
            <button
              onClick={resetSearch}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* 게시글 목록 */}
        {!error && (
          <>
            {posts.length === 0 && searchQuery && !loading ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-400 text-xl mb-2">
                  검색 결과가 없습니다.
                </p>
                <p className="text-gray-500">다른 검색어로 시도해보세요.</p>
              </div>
            ) : posts.length === 0 && !searchQuery && !loading ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-400 text-xl mb-2">게시글이 없습니다.</p>
                <p className="text-gray-500">첫 번째 게시글을 작성해보세요!</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <article
                    key={post.id}
                    ref={index === posts.length - 1 ? lastElementRef : null}
                    onClick={() => handlePostClick(post)}
                    className="group bg-black/40 rounded-xl p-6 hover:bg-black/60 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1"
                  >
                    {/* 게시글 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
                          onClick={(e) =>
                            handleAuthorClick(e, post.user.userId)
                          }
                          title={post.user.username}
                        >
                          {post.user.username
                            ? post.user.username.charAt(0).toUpperCase()
                            : post.user.userId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span
                            className="text-blue-400 font-medium cursor-pointer hover:underline"
                            onClick={(e) =>
                              handleAuthorClick(e, post.user.userId)
                            }
                          >
                            {post.user.username || post.user.userId}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            by {post.user.userId}
                          </span>
                          <p className="text-gray-500 text-xs">
                            {new Date(post.createdAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-gray-400">
                        <span className="text-red-400">❤️</span>
                        <span className="text-sm">
                          {post.likedUsers.length}
                        </span>
                      </div>
                    </div>

                    {/* 게시글 제목 */}
                    <h2 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* 게시글 내용 미리보기 */}
                    <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                      {post.content.length > 120
                        ? post.content.substring(0, 120) + "..."
                        : post.content}
                    </p>

                    {/* 카테고리 표시 */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 푸터 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <span className="text-blue-400">💬</span>
                          <span>{post.comments.length}</span>
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                        자세히 보기 →
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 로딩 인디케이터 */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">
                  {searchQuery ? "검색 중..." : "게시글을 불러오는 중..."}
                </p>
              </div>
            )}

            {/* 더 이상 로드할 항목이 없을 때 */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center mt-12">
                <div className="inline-flex items-center space-x-2 text-gray-400">
                  <span>🎉</span>
                  <span>
                    {searchQuery
                      ? "모든 검색 결과를 확인했습니다"
                      : "모든 게시글을 확인했습니다"}
                  </span>
                  <span>🎉</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

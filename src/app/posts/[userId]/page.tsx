"use client";

import { use, useState, useRef, useEffect } from "react";
import { useUserCategories } from "@/hooks/useUserBlog";
import { useUserBlogInfinite } from "@/hooks/useUserBlogInfinite";
import CategorySidebar from "@/components/UserBlog/CategorySidebar";
import PostList from "@/components/UserBlog/PostList";
import FollowListModal from "@/components/UserBlog/FollowListModal";

interface UserBlogPageProps {
  params: Promise<{ userId: string }>;
}

export default function UserBlogPage({ params }: UserBlogPageProps) {
  const { userId } = use(params);

  // 선택된 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [followModal, setFollowModal] = useState<
    null | "followers" | "following"
  >(null);

  // 검색 input ref (포커스 유지를 위함)
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 새로운 무한스크롤 + 검색 훅 사용
  const {
    posts,
    loading,
    hasMore,
    error,
    searchInput,
    searchQuery,
    total,
    followerCount,
    followingCount,
    setSearchInput,
    lastElementRef,
  } = useUserBlogInfinite(userId, 10);

  // 카테고리 정보는 기존 훅 사용 (카테고리 목록만 필요)
  const { categories } = useUserCategories(userId);

  // 사용자 정보는 첫 번째 게시글에서 추출
  const userInfo = posts.length > 0 ? posts[0].user : null;

  // 카테고리 선택 핸들러 (검색 초기화)
  const handleCategorySelect = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
    // 카테고리 선택 시 검색 초기화
    setSearchInput("");
    // 검색 input에 포커스 유지
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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

  // 로딩 상태
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-black/80 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>블로그 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-black/80 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            에러가 발생했습니다
          </h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 (검색어가 없을 때만)
  if (posts.length === 0 && !loading && !searchQuery) {
    return (
      <div className="min-h-screen bg-black/80 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold">
              {userInfo?.username || userId}님의 블로그
            </h1>

            {/* 검색 UI - 포스트 상단 오른쪽 */}
            <div className="w-64">
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="게시글 검색..."
                autoFocus
                className="w-full px-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              아직 작성된 게시글이 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/80 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold">
                {userInfo?.username || userId}님의 블로그
              </h1>
              <div className="flex gap-4 text-gray-400 mt-1 text-base">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => setFollowModal("followers")}
                >
                  팔로워 {followerCount}명
                </span>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => setFollowModal("following")}
                >
                  팔로잉 {followingCount}명
                </span>
              </div>
            </div>

            {/* 검색 UI - 포스트 상단 오른쪽 */}
            <div className="w-64">
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="게시글 검색..."
                autoFocus
                className="w-full px-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <span>📝 총 {total}개의 게시글</span>
            {categories && <span>🏷️ {categories.length}개의 카테고리</span>}
            {selectedCategory && !searchQuery && (
              <span className="text-blue-400">
                현재: #{selectedCategory} 카테고리
              </span>
            )}
            {searchQuery && (
              <span className="text-blue-400">
                검색: &ldquo;{searchQuery}&rdquo;
                {loading && (
                  <span className="ml-2 text-gray-400">(검색 중...)</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 - 카테고리 */}
          <aside className="lg:col-span-1">
            <CategorySidebar
              categories={categories || []}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              totalPosts={total}
            />
          </aside>

          {/* 메인 콘텐츠 - 게시글 목록 */}
          <main className="lg:col-span-3">
            <PostList
              posts={posts}
              userId={userId}
              selectedCategory={selectedCategory}
              loading={loading}
              hasMore={hasMore}
              searchQuery={searchQuery}
              lastElementRef={lastElementRef}
            />
          </main>
        </div>

        {followModal && (
          <FollowListModal
            userId={userId}
            type={followModal}
            onClose={() => setFollowModal(null)}
          />
        )}
      </div>
    </div>
  );
}

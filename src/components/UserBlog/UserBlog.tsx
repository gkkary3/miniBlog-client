"use client";

import { useState, useRef, useEffect } from "react";
import { useUserCategories } from "@/hooks/useUserBlog";
import { useUserBlogInfinite } from "@/hooks/useUserBlogInfinite";
import CategorySidebar from "@/components/UserBlog/CategorySidebar";
import PostList from "@/components/UserBlog/PostList";
import FollowListModal from "@/components/UserBlog/FollowListModal";
import { getAuthToken } from "@/lib/commentApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserBlogSkeleton } from "@/components/Skeleton";

export default function UserBlog({ userId }: { userId: string }) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [followModal, setFollowModal] = useState<
    null | "followers" | "following"
  >(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    posts,
    loading,
    hasMore,
    error,
    userInfo,
    searchInput,
    searchQuery,
    total,
    followerCount,
    followingCount,
    isFollowing,
    setIsFollowing,
    setSearchInput,
    lastElementRef,
  } = useUserBlogInfinite(userId, 10);

  const { categories } = useUserCategories(userId);

  const [isHovered, setIsHovered] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      setCurrentUserId(authData.state.user?.userId);
    }
  }, []);

  const handleCategorySelect = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
    setSearchInput("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    if (
      searchInputRef.current &&
      document.activeElement !== searchInputRef.current
    ) {
      if (searchInput && loading) {
        searchInputRef.current.focus();
      }
    }
  }, [loading, searchInput]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setIsFollowLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/user/@${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("팔로우 상태 변경에 실패했습니다.");
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("팔로우 토글 실패:", err);
      alert("팔로우 상태 변경에 실패했습니다.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return <UserBlogSkeleton />;
  }

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

  if (posts.length === 0 && !loading && !searchQuery) {
    return (
      <div className="min-h-screen bg-black/80 text-white">
        <div className="container mx-auto px-4 py-8 max-w-[1200px]">
          <div className="mb-8">
            <div className="flex flex-col items-center mb-6">
              {userInfo?.profileImage ? (
                <Image
                  src={userInfo.profileImage}
                  alt={`${userInfo.username || userId} 프로필`}
                  width={96}
                  height={96}
                  className="rounded-full object-cover mb-4 shadow-lg shadow-blue-500/20"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg shadow-blue-500/20">
                  {(userInfo?.username || userId).charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  {userInfo?.username || userId}
                </span>
                <span className="text-2xl text-gray-400 font-light tracking-wider">
                  &apos;s Blog
                </span>
              </h1>
              <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-4 text-gray-400 mt-1 text-base">
                  <span
                    className="cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => setFollowModal("followers")}
                  >
                    팔로워 {followerCount}명
                  </span>
                  <span
                    className="cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => setFollowModal("following")}
                  >
                    팔로잉 {followingCount}명
                  </span>
                </div>
                {currentUserId?.toString() !== userId && (
                  <button
                    onClick={handleFollowToggle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isFollowLoading}
                    className={`
                      w-28 px-4 py-2 rounded-full text-sm font-semibold transition-all
                      ${
                        isFollowLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : isFollowing
                          ? isHovered
                            ? "bg-red-500 text-white"
                            : "bg-gray-300 text-gray-800"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }
                    `}
                  >
                    {isFollowLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </span>
                    ) : isFollowing ? (
                      isHovered ? (
                        "해제"
                      ) : (
                        "팔로잉"
                      )
                    ) : (
                      "팔로우"
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
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
              <div className="w-64">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="게시글 검색..."
                  className="w-full px-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <CategorySidebar
                categories={categories || []}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                totalPosts={total}
              />
            </aside>
            <main className="lg:col-span-3">
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">
                  아직 작성된 게시글이 없습니다.
                </p>
              </div>
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

  return (
    <div className="min-h-screen bg-black/80 text-white">
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="mb-8">
          <div className="flex flex-col items-center mb-6">
            {userInfo?.profileImage ? (
              <Image
                src={userInfo.profileImage}
                alt={`${userInfo.username || userId} 프로필`}
                width={96}
                height={96}
                className="rounded-full object-cover mb-4 shadow-lg shadow-blue-500/20"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg shadow-blue-500/20">
                {(userInfo?.username || userId).charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                {userInfo?.username || userId}
              </span>
              <span className="text-2xl text-gray-400 font-light tracking-wider">
                &apos;s Blog
              </span>
            </h1>
            <div className="flex flex-col gap-2 items-center">
              <div className="flex gap-4 text-gray-400 mt-1 text-base">
                <span
                  className="cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => setFollowModal("followers")}
                >
                  팔로워 {followerCount}명
                </span>
                <span
                  className="cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => setFollowModal("following")}
                >
                  팔로잉 {followingCount}명
                </span>
              </div>
              {currentUserId?.toString() !== userId && (
                <button
                  onClick={handleFollowToggle}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  disabled={isFollowLoading}
                  className={`
                    w-28 px-4 py-2 rounded-full text-sm font-semibold transition-all
                    ${
                      isFollowLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : isFollowing
                        ? isHovered
                          ? "bg-red-500 text-white"
                          : "bg-gray-300 text-gray-800"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }
                  `}
                >
                  {isFollowLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </span>
                  ) : isFollowing ? (
                    isHovered ? (
                      "해제"
                    ) : (
                      "팔로잉"
                    )
                  ) : (
                    "팔로우"
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
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
            <div className="w-64">
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="게시글 검색..."
                className="w-full px-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <CategorySidebar
              categories={categories || []}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              totalPosts={total}
            />
          </aside>
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

"use client";

import { use, useState } from "react";
import { useUserBlog, useUserCategories } from "@/hooks/useUserBlog";
import CategorySidebar from "@/components/UserBlog/CategorySidebar";
import PostList from "@/components/UserBlog/PostList";

interface UserBlogPageProps {
  params: Promise<{ userId: string }>;
}

export default function UserBlogPage({ params }: UserBlogPageProps) {
  const { userId } = use(params);

  // 선택된 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: blogData,
    isLoading: blogLoading,
    error: blogError,
  } = useUserBlog(userId);

  const { categories, isLoading: categoriesLoading } =
    useUserCategories(userId);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
  };

  // 로딩 상태
  if (blogLoading || categoriesLoading) {
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
  if (blogError) {
    return (
      <div className="min-h-screen bg-black/80 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            에러가 발생했습니다
          </h1>
          <p className="text-gray-400">{blogError.message}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!blogData || blogData.posts.length === 0) {
    return (
      <div className="min-h-screen bg-black/80 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{userId}님의 블로그</h1>
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
          <h1 className="text-4xl font-bold mb-4">
            {blogData.user?.username}님의 블로그
          </h1>
          <div className="flex items-center gap-6 text-gray-400">
            <span>📝 총 {blogData.totalPosts}개의 게시글</span>
            <span>🏷️ {blogData.totalCategories}개의 카테고리</span>
            {selectedCategory && (
              <span className="text-blue-400">
                현재: #{selectedCategory} 카테고리
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 - 카테고리 */}
          <aside className="lg:col-span-1">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              totalPosts={blogData.totalPosts}
            />
          </aside>

          {/* 메인 콘텐츠 - 게시글 목록 */}
          <main className="lg:col-span-3">
            <PostList
              posts={blogData.posts}
              userId={userId}
              selectedCategory={selectedCategory}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

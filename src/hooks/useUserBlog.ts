import { useQuery } from "@tanstack/react-query";
import { fetchUserBlog } from "@/lib/userBlogApi";
// import { UserBlogData, CategoryStats } from "@/types/post";

// 🔑 QueryKey 팩토리 (캐시 키 관리)
export const userBlogKeys = {
  all: ["userBlog"] as const,
  lists: () => [...userBlogKeys.all, "list"] as const,
  list: (userId: string) => [...userBlogKeys.lists(), userId] as const,
};

// 사용자 블로그 전체 데이터 조회
export const useUserBlog = (userId: string) => {
  return useQuery({
    queryKey: userBlogKeys.list(userId),
    queryFn: () => fetchUserBlog(userId),
    enabled: !!userId, // userId가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh (블로그 데이터는 자주 안 바뀜)
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 1, // 실패 시 1번만 재시도
  });
};

// 사용자 게시글만 가져오는 hook (derived data)
export const useUserPosts = (userId: string) => {
  const { data, ...rest } = useUserBlog(userId);

  return {
    data: data?.posts || [],
    posts: data?.posts || [],
    totalPosts: data?.totalPosts || 0,
    user: data?.user,
    ...rest,
  };
};

// 사용자 카테고리만 가져오는 hook (derived data)
export const useUserCategories = (userId: string) => {
  const { data, ...rest } = useUserBlog(userId);

  return {
    data: data?.categories || [],
    categories: data?.categories || [],
    totalCategories: data?.totalCategories || 0,
    ...rest,
  };
};

// 특정 카테고리의 게시글만 필터링하는 hook
export const usePostsByCategory = (userId: string, categoryName?: string) => {
  const { data: blogData, ...rest } = useUserBlog(userId);

  const filteredPosts =
    categoryName && blogData?.posts
      ? blogData.posts.filter((post) =>
          post.categories.some((cat) => cat.name === categoryName)
        )
      : blogData?.posts || [];

  return {
    data: filteredPosts,
    posts: filteredPosts,
    totalPosts: filteredPosts.length,
    isFiltered: !!categoryName,
    selectedCategory: categoryName,
    ...rest,
  };
};

// 카테고리 통계 헬퍼 hook
export const useCategoryStats = (userId: string) => {
  const { data, ...rest } = useUserBlog(userId);

  const stats = {
    totalCategories: data?.totalCategories || 0,
    totalPosts: data?.totalPosts || 0,
    averagePostsPerCategory: data?.totalCategories
      ? Math.round((data.totalPosts / data.totalCategories) * 10) / 10
      : 0,
    mostPopularCategory: data?.categories?.[0] || null, // 첫 번째가 가장 많은 게시글
  };

  return {
    data: stats,
    stats,
    categories: data?.categories || [],
    ...rest,
  };
};

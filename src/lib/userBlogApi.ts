import { UserPost, UserBlogData, CategoryStats, User } from "@/types/post";
import { getAuthToken } from "./commentApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 📝 새로운 페이지네이션 API용 타입들
export interface GetUserPostsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserPostsResponse {
  posts: UserPost[];
  total: number;
  user: User | null;
  page: number;
  limit: number;
  totalPages: number;
  searchTerm: string | null;
  followerCount: number;
  followingCount: number;
}

// 🔍 사용자 블로그 게시글 조회 (페이지네이션 + 검색 지원)
export const fetchUserPostsPaginated = async (
  userId: string,
  params?: GetUserPostsParams
): Promise<UserPostsResponse> => {
  console.log(`🔍 사용자 블로그 게시글 조회 시작: /posts/@${userId}`, params);

  try {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_URL}/posts/@${userId}${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: UserPostsResponse = await response.json();

    console.log(`📝 사용자 게시물 조회 완료:`, {
      사용자: userId,
      페이지: data.page,
      한페이지당: data.limit,
      전체개수: data.total,
      전체페이지: data.totalPages,
      검색어: data.searchTerm,
      조회된게시물: data.posts.length,
      followers: data.followerCount,
      following: data.followingCount,
    });

    return data;
  } catch (error) {
    console.error(`❌ 사용자 블로그 게시글 조회 실패 (@${userId}):`, error);
    throw new Error(
      error instanceof Error
        ? `사용자 블로그 게시글 조회 실패: ${error.message}`
        : "사용자 블로그 게시글 조회 중 알 수 없는 오류가 발생했습니다."
    );
  }
};

// 🔍 사용자 블로그 데이터 조회 함수
export const fetchUserBlog = async (userId: string): Promise<UserBlogData> => {
  console.log(`🔍 사용자 블로그 조회 시작: /posts/@${userId}`);

  try {
    const response = await fetch(`${API_URL}/posts/@${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // 📊 서버에서 게시물 배열 받기
    const data: UserPostsResponse = await response.json();
    const posts = data.posts;
    console.log(`📝 게시물 ${posts.length}개 조회 완료`);

    // 🏷️ 카테고리별 게시물 수 계산
    const categoryMap = new Map<string, CategoryStats>();

    posts.forEach((post) => {
      post.categories.forEach((category) => {
        const categoryName = category.name;

        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName)!.count++;
        } else {
          categoryMap.set(categoryName, {
            id: category.id,
            name: category.name,
            count: 1,
          });
        }
      });
    });

    // 📈 카테고리를 게시물 수 기준으로 내림차순 정렬
    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => b.count - a.count
    );

    // 👤 사용자 정보 추출 (첫 번째 게시물에서)
    const userInfo = posts.length > 0 ? posts[0].user : null;

    const result: UserBlogData = {
      posts,
      user: userInfo,
      categories,
      totalPosts: posts.length,
      totalCategories: categories.length,
      followerCount: data.followerCount,
      followingCount: data.followingCount,
    };

    console.log(`✅ 사용자 블로그 데이터 처리 완료:`, {
      사용자: userInfo?.username || "Unknown",
      게시물수: posts.length,
      카테고리수: categories.length,
      카테고리목록: categories
        .map((cat) => `${cat.name}(${cat.count})`)
        .join(", "),
    });

    return result;
  } catch (error) {
    console.error(`❌ 사용자 블로그 조회 실패 (@${userId}):`, error);
    throw new Error(
      error instanceof Error
        ? `사용자 블로그 조회 실패: ${error.message}`
        : "사용자 블로그 조회 중 알 수 없는 오류가 발생했습니다."
    );
  }
};

// 🔍 게시물 미리보기 텍스트 생성 헬퍼 함수
export const getPostPreview = (
  content: string,
  maxLength: number = 150
): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + "...";
};

// 📅 날짜 포맷팅 헬퍼 함수
export const formatPostDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "오늘";
  } else if (diffInDays === 1) {
    return "어제";
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

// 🏷️ 카테고리별 색상 생성 헬퍼 함수 (UI용)
export const getCategoryColor = (categoryName: string): string => {
  // 카테고리 이름을 기반으로 일관된 색상 생성
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-yellow-600",
    "bg-indigo-600",
    "bg-red-600",
    "bg-teal-600",
  ];

  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const fetchUserFollowers = async (userId: string): Promise<boolean> => {
  const authStorage = localStorage.getItem("auth-storage");
  let currentUserId: number | null = null;

  if (authStorage) {
    const authData = JSON.parse(authStorage);
    currentUserId = authData.state.user?.id;
  }

  const queryParams = currentUserId ? `?currentUserId=${currentUserId}` : "";

  const response = await fetch(
    `${API_URL}/user/@${userId}/follow-status${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.isFollowing;
};

// 👤 사용자 정보 수정 API
export const updateUserInfo = async (
  userPk: number, // 고유 id (pk)
  data: { username: string; userId: string; profileImage?: string }
): Promise<unknown> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("사용자 정보 수정을 위해 로그인이 필요합니다.");
  }

  const response = await fetch(`${API_URL}/user/${userPk}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

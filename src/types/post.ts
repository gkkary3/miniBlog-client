export interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: string;
    // 필요하다면 name이나 다른 사용자 정보도 추가
    email: string;
  };
  likedUsers: {
    id: number;
    userId: string;
  }[];
}

// === 사용자 블로그용 타입들 ===

// 카테고리 타입
export interface Category {
  id: number;
  name: string;
}

// 완전한 사용자 정보 타입
export interface User {
  id: number;
  username: string;
  email: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 사용자 블로그용 게시글 타입
export interface UserPost {
  id: number;
  title: string;
  content: string;
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  categories: Category[];
  commentCount: number;
  likeCount: number;
}

// 카테고리 통계 타입
export interface CategoryStats {
  id: number;
  name: string;
  count: number; // 해당 카테고리의 게시물 수
}

// 사용자 블로그 전체 데이터 타입
export interface UserBlogData {
  posts: UserPost[];
  user: User | null;
  categories: CategoryStats[];
  totalPosts: number;
  totalCategories: number;
  followerCount: number;
  followingCount: number;
}

// 검색 API 응답용 게시글 타입
export interface SearchPost {
  id: number;
  title: string;
  content: string;
  images: string | null;
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  likedUsers: {
    id: number;
    userId: string;
  }[];
  categories: Category[];
  comments: Comment[];
}

// 검색 API 응답 타입
export interface SearchResponse {
  posts: SearchPost[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

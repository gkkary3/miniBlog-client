import { useState, useCallback, useRef, useEffect } from "react";
import { UserPost, User } from "@/types/post";
import {
  fetchUserFollowers,
  fetchUserPostsPaginated,
  GetUserPostsParams,
  UserPostsResponse,
} from "@/lib/userBlogApi";

interface UseUserBlogInfiniteResult {
  posts: UserPost[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  searchInput: string;
  searchQuery: string;
  total: number;
  totalPages: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  setIsFollowing: (value: boolean) => void;
  setSearchInput: (input: string) => void;
  resetSearch: () => void;
  lastElementRef: (node: HTMLElement | null) => void;
  userInfo: User | null;
}

export function useUserBlogInfinite(
  userId: string,
  limit: number = 10
): UseUserBlogInfiniteResult {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(""); // 사용자 입력값
  const [searchQuery, setSearchQuery] = useState(""); // debounced 검색어
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const isInitialMount = useRef(true);

  // 게시글 조회 함수
  const fetchPosts = useCallback(
    async (
      pageNum: number,
      isNewLoad: boolean = false,
      searchTerm: string = ""
    ) => {
      console.log(
        `🔍 fetchPosts 호출: page=${pageNum}, isNewLoad=${isNewLoad}, search="${searchTerm}"`
      );

      setLoading(true);
      setError(null);

      try {
        const params: GetUserPostsParams = {
          page: pageNum,
          limit: limit,
        };

        // 검색어가 있고 공백이 아닌 경우에만 추가
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const data: UserPostsResponse = await fetchUserPostsPaginated(
          userId,
          params
        );

        if (data.user) {
          setUserInfo(data.user);
        }

        const isFollowing = await fetchUserFollowers(userId);

        console.log(
          `✅ fetchPosts 성공: ${data.posts.length}개 게시글, 총 ${data.total}개`
        );

        if (isNewLoad) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }

        setTotal(data.total);
        setTotalPages(data.totalPages);
        setHasMore(data.posts.length > 0 && pageNum < data.totalPages);
        setFollowerCount(data.followerCount);
        setFollowingCount(data.followingCount);
        setIsFollowing(isFollowing);
      } catch (err: unknown) {
        console.error(`❌ fetchPosts 실패:`, err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "게시글을 불러오는 중 오류가 발생했습니다.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [userId, limit]
  );

  // 더 많은 게시글 로드
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, false, searchQuery);
    }
  }, [loading, hasMore, page, searchQuery, fetchPosts]);

  // 검색 초기화
  const resetSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // 무한 스크롤 Ref
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  // 실시간 검색을 위한 debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`⏱️ Debounce 완료: "${searchInput}" -> "${searchInput}"`);
      setSearchQuery(searchInput);
    }, 300);

    return () => {
      console.log(`⏱️ Debounce 취소: "${searchInput}"`);
      clearTimeout(timer);
    };
  }, [searchInput]);

  // 검색어 변경 시 새로 로드
  useEffect(() => {
    // 초기 마운트 시에는 실행하지 않음 (아래 useEffect에서 처리)
    if (isInitialMount.current) {
      return;
    }

    console.log(`🔄 검색어 변경: "${searchQuery}"`);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchPosts(1, true, searchQuery);
  }, [searchQuery, fetchPosts]);

  // 컴포넌트 마운트 시 기본 게시글 로드
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log(`🚀 초기 로드 시작`);
      fetchPosts(1, true, "");
    }
  }, [fetchPosts]);

  return {
    posts,
    loading,
    hasMore,
    error,
    userInfo,
    searchInput,
    searchQuery,
    total,
    totalPages,
    followerCount,
    followingCount,
    isFollowing,
    setIsFollowing,
    setSearchInput,
    resetSearch,
    lastElementRef,
  };
}

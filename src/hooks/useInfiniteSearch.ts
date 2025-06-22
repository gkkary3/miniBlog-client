import { useState, useCallback, useRef, useEffect } from "react";
import { SearchPost, SearchResponse } from "../types/post";

interface UseInfiniteSearchResult {
  posts: SearchPost[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  searchInput: string;
  searchQuery: string;
  total: number;
  totalPages: number;
  sortBy: SortType;
  setSortBy: (sortType: SortType) => void;
  setSearchInput: (input: string) => void;
  setSearchQuery: (query: string) => void;
  loadMore: () => void;
  resetSearch: () => void;
  lastElementRef: (node: HTMLElement | null) => void;
}

export enum SortType {
  LATEST = "latest",
  LIKES = "likes",
  COMMENTS = "comments",
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useInfiniteSearch(limit: number = 10): UseInfiniteSearchResult {
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(""); // 사용자 입력값
  const [searchQuery, setSearchQuery] = useState(""); // debounced 검색어
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<SortType>(SortType.LATEST);

  const observer = useRef<IntersectionObserver | null>(null);

  // 검색 게시글 가져오기 (빈 검색어일 때는 모든 게시글 가져옴)
  const fetchSearchPosts = useCallback(
    async (
      searchTerm: string,
      pageNum: number,
      sortType: SortType,
      isNewSearch: boolean = false
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          search: searchTerm,
          page: pageNum.toString(),
          limit: limit.toString(),
          sortBy: sortType,
        });

        const response = await fetch(`${API_URL}/posts?${params}`);

        if (!response.ok) {
          throw new Error(
            searchTerm
              ? "검색에 실패했습니다."
              : "게시글을 불러오는데 실패했습니다."
          );
        }

        const data: SearchResponse = await response.json();

        if (isNewSearch) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }

        setTotal(data.total);
        setTotalPages(data.totalPages);
        setHasMore(pageNum < data.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchPosts(searchQuery, nextPage, sortBy, false);
    }
  }, [loading, hasMore, page, searchQuery, sortBy, fetchSearchPosts]);

  // 검색어 직접 설정 (기존 방식 호환용)
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setSearchInput(query); // input도 동기화
      setPage(1);
      setPosts([]);
      setHasMore(true);
      fetchSearchPosts(query, 1, sortBy, true);
    },
    [sortBy, fetchSearchPosts]
  );

  const resetSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    // 빈 검색어로 기본 게시글 목록 로드
    fetchSearchPosts("", 1, sortBy, true);
  }, [sortBy, fetchSearchPosts]);

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
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 검색어 변경 시 새로 로드
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchSearchPosts(searchQuery, 1, sortBy, true);
  }, [searchQuery, sortBy, fetchSearchPosts]);

  // 컴포넌트 마운트 시 기본 게시글 로드 (빈 검색어로)
  useEffect(() => {
    fetchSearchPosts("", 1, sortBy, true);
  }, [sortBy, fetchSearchPosts]);

  return {
    posts,
    loading,
    hasMore,
    error,
    searchInput,
    searchQuery,
    total,
    totalPages,
    sortBy,
    setSortBy,
    setSearchInput,
    setSearchQuery: handleSearch,
    loadMore,
    resetSearch,
    lastElementRef,
  };
}

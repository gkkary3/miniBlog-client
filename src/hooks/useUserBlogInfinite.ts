import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { fetchPosts } from "@/lib/userBlogApi";
import { debounce } from "lodash";
import { UserPost } from "@/types/post";

interface UseUserBlogInfiniteResult {
  posts: UserPost[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
}

export default function useUserBlogInfinite(
  userId: string
): UseUserBlogInfiniteResult {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const debouncedSetSearchQuery = useCallback(
    debounce((newSearchQuery: string) => {
      setSearchQuery(newSearchQuery);
    }, 500),
    []
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["userBlogPosts", userId, searchQuery],
      queryFn: ({ pageParam = 1 }) =>
        fetchPosts(userId, {
          page: pageParam,
          search: searchQuery,
        }),
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage < lastPage.totalPages) {
          return lastPage.currentPage + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchInput = e.target.value;
    setSearchInput(newSearchInput);
    debouncedSetSearchQuery(newSearchInput);
  };

  useEffect(() => {
    if (searchQuery !== undefined) {
      queryClient.resetQueries({
        queryKey: ["userBlogPosts", userId],
      });
    }
  }, [searchQuery, userId, queryClient]);

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  return {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    searchInput,
    handleSearchInputChange,
    searchQuery,
  };
}

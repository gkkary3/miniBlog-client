import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/commentApi";
import { CreateCommentRequest, UpdateCommentRequest } from "@/types/comment";

// 🔑 QueryKey 팩토리 (캐시 키 관리)
export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (userId: string, postId: string) =>
    [...commentKeys.lists(), userId, postId] as const,
};

// 💬 댓글 목록 조회 (토큰 불필요, 자동 캐싱!)
export const useComments = (userId: string, postId: string) => {
  return useQuery({
    queryKey: commentKeys.list(userId, postId),
    queryFn: () => fetchComments(userId, postId),
    enabled: !!userId && !!postId, // 파라미터가 있을 때만 실행
    staleTime: 30 * 1000, // 30초 동안 fresh (댓글은 자주 바뀔 수 있으니)
  });
};

// ✍️ 댓글 작성 Mutation
export const useCreateComment = (userId: string, postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      createComment(userId, postId, data),
    onSuccess: () => {
      // 🔄 댓글 목록 무효화하여 최신 데이터로 업데이트
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(userId, postId),
      });
    },
    onError: (error) => {
      console.error("댓글 작성 실패:", error);
    },
  });
};

// 🔄 댓글 수정 Mutation
export const useUpdateComment = (userId: string, postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentRequest;
    }) => updateComment(userId, postId, commentId, data),
    onSuccess: () => {
      // 🔄 댓글 목록 무효화하여 수정 내용 반영
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(userId, postId),
      });
    },
    onError: (error) => {
      console.error("댓글 수정 실패:", error);
    },
  });
};

// 🗑️ 댓글 삭제 Mutation
export const useDeleteComment = (userId: string, postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      // 🔄 댓글 목록 무효화하여 삭제 반영
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(userId, postId),
      });
    },
    onError: (error) => {
      console.error("댓글 삭제 실패:", error);
    },
  });
};

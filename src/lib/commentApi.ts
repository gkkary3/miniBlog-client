import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types/comment";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔑 토큰 가져오기 헬퍼 (작성/수정/삭제용)
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  const authData = localStorage.getItem("auth-storage");
  if (!authData) return null;
  return JSON.parse(authData)?.state?.accessToken;
};

// 💬 댓글 목록 조회 (토큰 불필요!)
export async function fetchComments(userId: string, postId: string) {
  try {
    const response = await fetch(
      `${API_URL}/posts/@${userId}/${postId}/comments`
    );

    if (!response.ok) {
      throw new Error("댓글을 불러오는데 실패했습니다.");
    }

    const comments = await response.json();
    return comments;
  } catch (error) {
    throw error;
  }
}

// ✍️ 댓글 작성 (토큰 필요)
export async function createComment(
  userId: string,
  postId: string,
  content: string
) {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_URL}/posts/@${userId}/${postId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error("댓글 작성에 실패했습니다.");
    }

    const newComment = await response.json();
    return newComment;
  } catch (error) {
    throw error;
  }
}

// 🔄 댓글 수정 (토큰 필요)
export async function updateComment(commentId: number, content: string) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/comment/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("댓글 수정에 실패했습니다.");
    }

    const updatedComment = await response.json();
    return updatedComment;
  } catch (error) {
    throw error;
  }
}

// 🗑️ 댓글 삭제 (토큰 필요)
export async function deleteComment(commentId: number) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("댓글 삭제에 실패했습니다.");
    }
  } catch (error) {
    throw error;
  }
}

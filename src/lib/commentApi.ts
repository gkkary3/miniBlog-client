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
export const fetchComments = async (
  userId: string,
  postId: string
): Promise<Comment[]> => {
  console.log(`댓글 조회 요청: ${API_URL}/posts/@${userId}/${postId}/comments`);

  const response = await fetch(
    `${API_URL}/posts/@${userId}/${postId}/comments`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 🎯 토큰 없이 요청
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `댓글 조회 실패: ${response.status} ${response.statusText}`
    );
  }

  const comments = await response.json();
  console.log("댓글 조회 성공:", comments);

  // 🔍 서버에서 이미 트리 구조로 오는지 확인
  if (comments.length > 0 && comments[0].replies) {
    // 서버에서 이미 트리 구조로 제공하는 경우
    console.log("서버에서 트리 구조 제공됨");
    return comments;
  } else {
    // 서버에서 flat 구조로 제공하는 경우 클라이언트에서 트리 구조로 변환
    console.log("클라이언트에서 트리 구조로 변환");
    return organizeCommentsToTree(comments);
  }
};

// 🌳 댓글을 트리 구조로 정리하는 헬퍼 함수
export const organizeCommentsToTree = (comments: Comment[]): Comment[] => {
  const commentMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  // 먼저 모든 댓글을 Map에 저장하고 replies 배열 초기화, depth 설정
  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
      depth: comment.parentId ? 1 : 0, // 부모 댓글이 있으면 depth 1, 없으면 0
    });
  });

  // 부모-자식 관계 설정
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parentId) {
      // 대댓글인 경우 부모 댓글의 replies에 추가
      const parentComment = commentMap.get(comment.parentId);
      if (parentComment) {
        parentComment.replies!.push(commentWithReplies);
      }
    } else {
      // 원댓글인 경우 루트 목록에 추가
      rootComments.push(commentWithReplies);
    }
  });

  // 댓글을 생성일 기준으로 정렬
  rootComments.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 각 댓글의 replies도 정렬
  rootComments.forEach((comment) => {
    if (comment.replies) {
      comment.replies.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  });

  return rootComments;
};

// ✍️ 댓글 작성 (토큰 필요)
export const createComment = async (
  userId: string,
  postId: string,
  data: CreateCommentRequest
): Promise<Comment> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("댓글 작성을 위해 로그인이 필요합니다.");
  }

  console.log(
    `댓글 작성 요청: ${API_URL}/posts/@${userId}/${postId}/comments`,
    data
  );

  const response = await fetch(
    `${API_URL}/posts/@${userId}/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `댓글 작성 실패: ${response.status} ${response.statusText}`
    );
  }

  const newComment = await response.json();
  console.log("댓글 작성 성공:", newComment);
  return newComment;
};

// 🔄 댓글 수정 (토큰 필요)
export const updateComment = async (
  userId: string,
  postId: string,
  commentId: string,
  data: UpdateCommentRequest
): Promise<Comment> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("댓글 수정을 위해 로그인이 필요합니다.");
  }

  console.log(
    `댓글 수정 요청: ${API_URL}/posts/@${userId}/${postId}/comments/${commentId}`,
    data
  );

  const response = await fetch(
    `${API_URL}/posts/@${userId}/${postId}/comments/${commentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `댓글 수정 실패: ${response.status} ${response.statusText}`
    );
  }

  const updatedComment = await response.json();
  console.log("댓글 수정 성공:", updatedComment);
  return updatedComment;
};

// 🗑️ 댓글 삭제 (토큰 필요)
export const deleteComment = async (commentId: string): Promise<void> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("댓글 삭제를 위해 로그인이 필요합니다.");
  }

  console.log(`댓글 삭제 요청: ${API_URL}/comment/${commentId}`);

  const response = await fetch(`${API_URL}/comment/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `댓글 삭제 실패: ${response.status} ${response.statusText}`
    );
  }

  console.log("댓글 삭제 성공");
};

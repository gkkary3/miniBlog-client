// 💬 댓글 기본 타입
export interface Comment {
  id: number; // 댓글 고유 ID
  content: string; // 댓글 내용
  userId: number; // 작성자의 User 테이블 ID (숫자)
  username: string; // 작성자 이름
  postId: number; // 게시글 ID
  createdAt: string; // 생성일 (ISO 문자열)
  updatedAt: string; // 수정일 (ISO 문자열)

  // 👤 작성자 상세 정보 (서버에서 Join으로 가져올 가능성)
  user: {
    id: number; // User 테이블의 고유 ID
    username: string; // 사용자 이름
    userId: string; // 사용자 고유 문자열 ID (예: "Soda")
    profileImage?: string; // 프로필 이미지 URL
  };
}

// 📝 댓글 작성할 때 보낼 데이터 타입
export interface CreateCommentRequest {
  content: string; // 댓글 내용만 필요 (나머지는 서버에서 JWT로 처리)
}

// 🔄 댓글 수정할 때 보낼 데이터 타입
export interface UpdateCommentRequest {
  content: string; // 댓글 내용만 수정 가능
}

// 📊 댓글 응답 타입 (API 응답용)
export interface CommentResponse {
  comments: Comment[]; // 댓글 목록
  total: number; // 전체 댓글 수 (페이지네이션용)
  page?: number; // 현재 페이지 (나중에 페이지네이션 추가 시)
  limit?: number; // 페이지당 댓글 수
}

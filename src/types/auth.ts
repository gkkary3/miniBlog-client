// 사용자 정보 타입
export interface User {
  id: number; // 사용자 고유 번호 (숫자)
  email: string; // 이메일 주소
  username: string; // 사용자 이름
  userId: string; // 사용자 ID (문자열, 고유값)
}

// 로그인할 때 보낼 데이터 타입
export interface LoginRequest {
  email: string; // 이메일
  password: string; // 비밀번호
}

// 회원가입할 때 보낼 데이터 타입
export interface RegisterRequest {
  email: string; // 이메일
  password: string; // 비밀번호
  username: string; // 사용자 이름
  userId: string; // 사용자 ID (고유값)
}

// 로그인 성공 시 서버에서 받는 데이터 타입
export interface AuthResponse {
  accessToken: string; // 인증 토큰 (30분 정도 유효)
  refreshToken: string; // 새로운 accessToken을 받기 위한 토큰
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categories: string[];
}

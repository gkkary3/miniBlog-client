// 사용자 정보 타입
export interface User {
  id: number; // 사용자 고유 번호 (숫자)
  email: string; // 이메일 주소
  username: string; // 사용자 이름
  userId: string; // 사용자 ID (문자열, 고유값)
  profileImage?: string; // 프로필 이미지 URL (선택사항)
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
  images: string[];
  thumbnail?: string;
}

// 🆕 OAuth 관련 타입들
export type OAuthProvider = "google" | "kakao";

// OAuth 로그인 시작 요청 타입
export interface OAuthLoginRequest {
  provider: OAuthProvider;
  redirectUrl?: string; // 콜백 URL (선택사항)
}

// OAuth 콜백 응답 타입
export interface OAuthCallbackResponse {
  accessToken: string;
  refreshToken: string;
  user?: User; // 일부 OAuth 제공자는 사용자 정보도 함께 전송
}

// OAuth 에러 응답 타입
export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
  state?: string; // OAuth state 파라미터
}

// OAuth 콜백 페이지에서 사용할 URL 파라미터 타입
export interface OAuthCallbackParams {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  error_description?: string;
  state?: string;
}

// OAuth 사용자 정보 타입 (각 제공자별로 다를 수 있음)
export interface OAuthUserInfo {
  provider: OAuthProvider;
  providerId: string; // OAuth 제공자에서 제공하는 고유 ID
  email: string;
  name: string;
  picture?: string; // 프로필 이미지 URL
}

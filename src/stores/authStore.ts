import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AuthResponse,
  CreatePostRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearTokens: () => void;
  setLoading: (loading: boolean) => void;
  fetchUserInfo: () => Promise<void>;
  forceUserUpdate: () => void;
  createPost: (data: CreatePostRequest) => Promise<void>;
  updatePost: (postId: string, data: CreatePostRequest) => Promise<void>;

  refreshAccessToken: () => Promise<string>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  initializeAuth: () => Promise<void>;

  // 🆕 OAuth 로그인 함수들 추가
  startGoogleLogin: () => void;
  startKakaoLogin: () => void;
  setSocialLogin: (data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => void;
  handleOAuthCallback: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      // 로그인 함수
      login: async (data: LoginRequest) => {
        // 로딩 시작
        set({ loading: true });

        try {
          // 서버에 로그인 요청
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data), // { email, password }
          });

          if (!response.ok) {
            throw new Error("로그인 실패");
          }

          // 서버 응답에서 토큰들 받기
          const result: AuthResponse = await response.json();

          // 받은 토큰들을 상태에 저장
          set({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
            loading: false,
          });

          // 토큰으로 사용자 정보 가져오기
          await get().fetchUserInfo();
        } catch (error) {
          set({ loading: false });
          console.error("로그인 에러:", error);
          throw error;
        }
      },

      // 사용자 정보 가져오기 함수
      fetchUserInfo: async () => {
        try {
          const { accessToken } = get();
          
          if (!accessToken) {
            console.error("사용자 정보 가져오기 실패: accessToken이 없습니다.");
            throw new Error("Access token이 없습니다.");
          }
          
          console.log("사용자 정보 가져오기 시작");
          
          // authenticatedFetch 사용 (자동 토큰 갱신)
          const response = await get().authenticatedFetch(`${API_URL}/auth/me`);

          if (response.ok) {
            const userInfo: User = await response.json();
            console.log("사용자 정보 가져오기 성공:", userInfo);
            set({ user: userInfo });
          } else {
            const errorText = await response.text();
            console.error("사용자 정보 가져오기 실패:", response.status, errorText);
            throw new Error(`사용자 정보 가져오기 실패: ${response.status}`);
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 에러:", error);
          throw error;
        }
      },

      forceUserUpdate: () => {
        get().fetchUserInfo(); // 다시 한번 호출
      },

      // 회원가입 함수
      register: async (data: RegisterRequest) => {
        set({ loading: true });

        try {
          const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data), // { email, password, username, userId }
          });

          if (!response.ok) {
            throw new Error("회원가입 실패");
          }

          const result: AuthResponse = await response.json();

          // 회원가입 성공하면 자동으로 로그인 상태로 만들기
          set({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
            loading: false,
          });

          // 사용자 정보 가져오기
          await get().fetchUserInfo();
        } catch (error) {
          set({ loading: false });
          console.error("회원가입 에러:", error);
          throw error;
        }
      },

      // 로그아웃 함수
      logout: () => {
        // 모든 상태를 초기화
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // 토큰만 초기화하는 함수 (refreshToken은 유지)
      clearTokens: () => {
        set({
          accessToken: null,
          isAuthenticated: false,
        });
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // 토큰 갱신 함수
      refreshAccessToken: async () => {
        try {
          const { refreshToken, accessToken } = get();
          
          console.log("토큰 갱신 시작:", {
            hasRefreshToken: !!refreshToken,
            hasAccessToken: !!accessToken
          });
          
          if (!refreshToken) {
            console.error("Refresh token이 없습니다.");
            throw new Error("Refresh token이 없습니다.");
          }

          console.log("Access Token 갱신 중...");

          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
            body: JSON.stringify({
              accessToken: accessToken || "", // null인 경우 빈 문자열로 전송
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("토큰 갱신 서버 응답:", response.status, errorText);
            throw new Error(`토큰 갱신 실패: ${response.status}`);
          }

          const data = await response.json();

          // 새로운 토큰들로 업데이트
          set({
            accessToken: data.accessToken,
            isAuthenticated: true,
          });

          console.log(
            "토큰 갱신 성공 - 새 토큰:",
            data.accessToken.substring(0, 20) + "..."
          );
          return data.accessToken;
        } catch (error) {
          console.error("토큰 갱신 실패:", error);

          // 토큰 갱신 실패 시 로그아웃 처리
          console.log("토큰 갱신 실패 - 로그아웃 처리");
          get().logout();

          throw error;
        }
      },

      // 인증이 필요한 API 요청 헬퍼 함수
      authenticatedFetch: async (url: string, options: RequestInit = {}) => {
        const makeRequest = async (token: string) => {
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`,
            },
          });
        };

        try {
          const { accessToken, refreshToken } = get();
          
          console.log("인증된 요청 시작:", {
            url,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          });
          
          if (!accessToken) {
            console.error("Access token이 없습니다.");
            throw new Error("Access token이 없습니다.");
          }

          // 첫 번째 시도
          let response = await makeRequest(accessToken);

          // 401 에러 (토큰 만료) 시 토큰 갱신 후 재시도
          if (response.status === 401) {
            console.log("토큰 만료 감지, 자동 갱신 시도...");

            try {
              await get().refreshAccessToken();
              // 갱신된 토큰을 다시 가져와서 사용
              const { accessToken: newAccessToken } = get();
              if (!newAccessToken) {
                throw new Error("토큰 갱신 후에도 access token이 없습니다.");
              }
              console.log(
                "새로운 토큰으로 재시도:",
                newAccessToken.substring(0, 20) + "..."
              );
              response = await makeRequest(newAccessToken);
            } catch (refreshError) {
              console.error("토큰 갱신 실패:", refreshError);
              // 토큰 갱신 실패 시 로그아웃 처리
              get().logout();
              throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
            }
          }

          return response;
        } catch (error) {
          console.error("인증된 요청 실패:", error);
          throw error;
        }
      },

      // 앱 시작시 토큰 상태 확인
      initializeAuth: async () => {
        const { accessToken, refreshToken } = get();

        console.log("인증 상태 초기화 중...", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        if (!accessToken && !refreshToken) {
          console.log("토큰이 없음 - 로그인 필요");
          return;
        }

        if (!accessToken && refreshToken) {
          // Access token만 없으면 갱신 시도
          try {
            console.log("Access Token이 없음 - 갱신 시도");
            await get().refreshAccessToken();
            await get().fetchUserInfo();
            console.log("토큰 갱신 및 사용자 정보 로드 성공");
          } catch (error) {
            console.error("토큰 갱신 실패:", error);
            console.log("토큰 갱신 실패 - 로그인 필요");
            // 갱신 실패 시 로그아웃 처리
            get().logout();
          }
        } else if (accessToken) {
          // Access token이 있으면 사용자 정보 가져오기 시도
          try {
            await get().fetchUserInfo();
            console.log("사용자 정보 로드 성공");
          } catch (error) {
            console.error("사용자 정보 로드 실패:", error);
            console.log("사용자 정보 로드 실패 - 토큰 갱신 시도");
            try {
              await get().refreshAccessToken();
              await get().fetchUserInfo();
              console.log("토큰 갱신 후 사용자 정보 로드 성공");
            } catch (refreshError) {
              console.error("토큰 갱신 실패:", refreshError);
              console.log("완전 실패 - 로그인 필요");
              // 완전 실패 시 로그아웃 처리
              get().logout();
            }
          }
        }
      },

      // 게시글 작성 함수
      createPost: async (data: CreatePostRequest) => {
        const { accessToken, user } = get();

        if (!accessToken || !user) {
          throw new Error("로그인이 필요합니다.");
        }

        set({ loading: true });

        try {
          // JWT 토큰과 함께 게시글 작성 요청
          const response = await get().authenticatedFetch(
            `${API_URL}/posts/@${user.userId}/write`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: data.title,
                content: data.content,
                categories: data.categories,
                images: data.images,
                thumbnail: data.thumbnail,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("게시글 작성에 실패했습니다.");
          }

          // 작성 성공
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          console.error("게시글 작성 에러:", error);
          throw error;
        }
      },

      // 게시글 수정 함수
      updatePost: async (postId: string, data: CreatePostRequest) => {
        const { accessToken, user } = get();

        if (!accessToken || !user) {
          throw new Error("로그인이 필요합니다.");
        }

        set({ loading: true });

        try {
          // JWT 토큰과 함께 게시글 수정 요청
          const response = await get().authenticatedFetch(
            `${API_URL}/posts/@${user.userId}/${postId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: data.title,
                content: data.content,
                categories: data.categories,
                images: data.images,
                thumbnail: data.thumbnail,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("게시글 수정에 실패했습니다.");
          }

          // 수정 성공
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          console.error("게시글 수정 에러:", error);
          throw error;
        }
      },

      // 🆕 OAuth 로그인 함수들 추가
      startGoogleLogin: () => {
        // Google OAuth 로그인 시작
        // 서버의 /auth/google 엔드포인트로 리다이렉트
        if (typeof window !== "undefined") {
          window.location.href = `${API_URL}/auth/google`;
        }
      },

      startKakaoLogin: () => {
        // Kakao OAuth 로그인 시작
        // 서버의 /auth/kakao 엔드포인트로 리다이렉트
        if (typeof window !== "undefined") {
          window.location.href = `${API_URL}/auth/kakao`;
        }
      },
      setSocialLogin: ({
        accessToken,
        refreshToken,
        user,
      }: {
        accessToken: string;
        refreshToken: string;
        user: User;
      }) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },
      handleOAuthCallback: async () => {
        if (typeof window === "undefined") return;

        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");
        const error = urlParams.get("error");

        console.log("OAuth 콜백 처리 시작:", { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          error 
        });

        if (error) {
          console.error("OAuth 로그인 에러:", error);
          throw new Error(`OAuth 로그인 실패: ${error}`);
        }

        if (!accessToken || !refreshToken) {
          console.error("OAuth 토큰이 없습니다:", { accessToken, refreshToken });
          throw new Error("OAuth 토큰을 받지 못했습니다.");
        }

        // 토큰을 즉시 저장
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        console.log("토큰 저장 완료:", {
          accessToken: accessToken.substring(0, 20) + "...",
          refreshToken: refreshToken.substring(0, 20) + "..."
        });

        // Zustand persist가 localStorage에 저장될 때까지 기다림
        await new Promise((resolve) => {
          const checkStorage = () => {
            const authData = localStorage.getItem("auth-storage");
            if (authData) {
              try {
                const parsed = JSON.parse(authData);
                if (
                  parsed.state?.accessToken === accessToken &&
                  parsed.state?.refreshToken === refreshToken
                ) {
                  console.log("localStorage에 토큰 저장 확인됨");
                  resolve(undefined);
                  return;
                }
              } catch (e) {
                console.error("localStorage 파싱 에러:", e);
              }
            }
            setTimeout(checkStorage, 10);
          };
          checkStorage();
        });

        // 사용자 정보 가져오기
        try {
          await get().fetchUserInfo();
          console.log("사용자 정보 가져오기 완료");
        } catch (error) {
          console.error("사용자 정보 가져오기 실패:", error);
          // 사용자 정보 가져오기 실패해도 토큰은 저장되어 있으므로 계속 진행
        }

        // URL에서 민감정보 제거
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("accessToken");
        newUrl.searchParams.delete("refreshToken");
        newUrl.searchParams.delete("error");
        window.history.replaceState({}, "", newUrl.toString());
        
        console.log("OAuth 콜백 처리 완료");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

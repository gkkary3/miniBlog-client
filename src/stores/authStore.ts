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
  setLoading: (loading: boolean) => void;
  fetchUserInfo: () => Promise<void>;
  createPost: (data: CreatePostRequest) => Promise<void>;
  updatePost: (postId: string, data: CreatePostRequest) => Promise<void>;

  refreshAccessToken: () => Promise<string>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  initializeAuth: () => Promise<void>;
}

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
          const response = await fetch("http://localhost:4000/auth/login", {
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
          // authenticatedFetch 사용 (자동 토큰 갱신)
          const response = await get().authenticatedFetch(
            "http://localhost:4000/auth/me"
          );

          if (response.ok) {
            const userInfo: User = await response.json();
            set({ user: userInfo });
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 에러:", error);
          throw error;
        }
      },

      // 회원가입 함수
      register: async (data: RegisterRequest) => {
        set({ loading: true });

        try {
          const response = await fetch("http://localhost:4000/auth/signup", {
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

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // 토큰 갱신 함수
      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error("Refresh token이 없습니다.");
          }

          console.log("Access Token 갱신 중...");

          const response = await fetch("http://localhost:4000/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("토큰 갱신 실패");
          }

          const data = await response.json();

          // 새로운 토큰들로 업데이트
          set({
            accessToken: data.accessToken,
          });

          console.log("토큰 갱신 성공");
          return data.accessToken;
        } catch (error) {
          console.error("토큰 갱신 실패:", error);
          // Refresh token도 만료된 경우 자동 로그아웃
          console.log("자동 로그아웃 처리");
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
          const { accessToken }: { accessToken: string | null } = get();
          if (!accessToken) {
            throw new Error("Access token이 없습니다.");
          }

          // 첫 번째 시도
          let response = await makeRequest(accessToken);

          // 401 에러 (토큰 만료) 시 토큰 갱신 후 재시도
          if (response.status === 401) {
            console.log("토큰 만료 감지, 자동 갱신 시도...");

            const newToken = await get().refreshAccessToken();
            response = await makeRequest(newToken);
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

        console.log("인증 상태 초기화 중...");

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
          } catch (error) {
            console.error("토큰 갱신 실패:", error);
            console.log("토큰 갱신 실패 - 로그인 필요");
          }
        } else if (accessToken) {
          // Access token이 있으면 사용자 정보 가져오기 시도
          try {
            await get().fetchUserInfo();
          } catch (error) {
            console.error("사용자 정보 로드 실패:", error);
            console.log("사용자 정보 로드 실패 - 토큰 갱신 시도");
            try {
              await get().refreshAccessToken();
              await get().fetchUserInfo();
            } catch (error) {
              console.error("토큰 갱신 실패:", error);
              console.log("완전 실패 - 로그인 필요");
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
            `http://localhost:4000/posts/@${user.userId}/write`,
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
            `http://localhost:4000/posts/@${user.userId}/${postId}`,
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

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
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      // ===== 로그인 함수 =====
      login: async (data: LoginRequest) => {
        // 1️⃣ 로딩 시작
        set({ loading: true });

        try {
          // 2️⃣ 서버에 로그인 요청
          const response = await fetch("http://localhost:4000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data), // { email, password }
          });

          if (!response.ok) {
            throw new Error("로그인 실패");
          }

          // 3️⃣ 서버 응답에서 토큰들 받기
          const result: AuthResponse = await response.json();

          // 4️⃣ 받은 토큰들을 상태에 저장
          set({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isAuthenticated: true,
            loading: false,
          });

          // 5️⃣ 토큰으로 사용자 정보 가져오기
          await get().fetchUserInfo();
        } catch (error) {
          set({ loading: false });
          console.error("로그인 에러:", error);
          throw error;
        }
      },

      // ===== 사용자 정보 가져오기 함수 =====
      fetchUserInfo: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await fetch("http://localhost:4000/auth/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const userInfo: User = await response.json();
            set({ user: userInfo });
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 에러:", error);
          throw error;
        }
      },

      // ===== 회원가입 함수 =====
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

      // ===== 로그아웃 함수 =====
      logout: () => {
        // 모든 상태를 초기화
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // ===== 로딩 상태 설정 =====
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // 🆕 create 함수 내부에 추가할 함수 (기존 함수들 아래에)
      createPost: async (data: CreatePostRequest) => {
        const { accessToken, user } = get();

        if (!accessToken || !user) {
          throw new Error("로그인이 필요합니다.");
        }

        set({ loading: true });

        try {
          // 🔐 JWT 토큰과 함께 게시글 작성 요청
          const response = await fetch(
            `http://localhost:4000/posts/@${user.userId}/write`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // JWT 토큰 포함
              },
              body: JSON.stringify({
                title: data.title,
                content: data.content,
                categories: data.categories, // 카테고리 배열로 전송
              }),
            }
          );

          if (!response.ok) {
            throw new Error("게시글 작성에 실패했습니다.");
          }

          // ✅ 작성 성공
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          console.error("게시글 작성 에러:", error);
          throw error;
        }
      },

      // 🆕 update 함수 내부에 추가할 함수 (기존 함수들 아래에)
      updatePost: async (postId: string, data: CreatePostRequest) => {
        const { accessToken, user } = get();

        if (!accessToken || !user) {
          throw new Error("로그인이 필요합니다.");
        }

        set({ loading: true });

        try {
          // 🔐 JWT 토큰과 함께 게시글 작성 요청
          const response = await fetch(
            `http://localhost:4000/posts/@${user.userId}/${postId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // JWT 토큰 포함
              },
              body: JSON.stringify({
                title: data.title,
                content: data.content,
                categories: data.categories, // 카테고리 배열로 전송
              }),
            }
          );

          if (!response.ok) {
            throw new Error("게시글 수정정에 실패했습니다.");
          }

          // ✅ 작성 성공
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          console.error("게시글 작성 에러:", error);
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

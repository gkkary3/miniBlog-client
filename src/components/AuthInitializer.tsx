"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 🚀 앱 시작 시 토큰 상태 초기화
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error("인증 초기화 실패:", error);

        // 🚪 토큰이 완전히 만료된 경우 로그인 페이지로 이동
        // 단, 이미 로그인/회원가입 페이지에 있거나 홈페이지에 있으면 리다이렉트하지 않음
        const publicPages = ["/login", "/register", "/posts"];
        const isPublicPage =
          publicPages.some((page) => pathname.startsWith(page)) ||
          pathname === "/";

        if (!isPublicPage) {
          console.log("🔓 인증 실패로 인한 로그인 페이지 리다이렉트");
          router.push("/login");
        }
      }
    };

    initAuth();
  }, [initializeAuth, router, pathname]);

  // UI를 렌더링하지 않는 헬퍼 컴포넌트
  return null;
}

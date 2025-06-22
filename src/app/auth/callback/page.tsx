"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../stores/authStore";

function OAuthCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const { handleOAuthCallback } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) {
      return;
    }
    processed.current = true;

    const processOAuthCallback = async () => {
      try {
        setStatus("loading");

        // URL에서 OAuth 관련 파라미터 확인
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const error = searchParams.get("error");

        // 에러가 있는 경우
        if (error) {
          setErrorMessage(`OAuth 로그인 실패: ${error}`);
          setStatus("error");
          return;
        }

        // 토큰이나 user가 없는 경우
        if (!accessToken || !refreshToken) {
          setErrorMessage("OAuth 토큰을 받지 못했습니다.");
          setStatus("error");
          return;
        }

        // 실제 파싱 및 set은 handleOAuthCallback에서!
        await handleOAuthCallback();

        setStatus("success");

        // 성공 시 잠시 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.replace("/posts");
        }, 1000);
      } catch (error) {
        console.error("OAuth 콜백 처리 에러:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        );
        setStatus("error");
      }
    };

    processOAuthCallback();
  }, [handleOAuthCallback, router, searchParams]);

  // 로딩 상태
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black/80 text-white flex items-center justify-center relative overflow-hidden">
        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
            로그인 처리 중...
          </h1>
          <p className="text-gray-400 text-lg">
            잠시만 기다려주세요. 로그인을 완료하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 성공 상태
  if (status === "success") {
    return (
      <div className="min-h-screen bg-black/80 text-white flex items-center justify-center relative overflow-hidden">
        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
            로그인 성공!
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            환영합니다! 잠시 후 메인 페이지로 이동합니다.
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
            <span>리다이렉트 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  return (
    <div className="min-h-screen bg-black/80 text-white flex items-center justify-center relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-600/10 to-red-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-4">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl">❌</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent">
          로그인 실패
        </h1>
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-red-400 mr-2 text-xl">⚠️</span>
            <p className="text-red-400 font-medium">오류 발생</p>
          </div>
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            로그인 페이지로 돌아가기
          </button>

          <button
            onClick={() => router.push("/posts")}
            className="w-full bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/40 transition-all duration-300 font-medium border border-gray-600 py-3 px-4"
          >
            메인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

// 로딩 폴백 컴포넌트
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black/80 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>로딩 중...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}

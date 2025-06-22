"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";

export default function SocialSignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSocialLogin } = useAuthStore();

  // 소셜에서 받은 정보 파싱
  const [socialData, setSocialData] = useState<any>(null);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        setSocialData(JSON.parse(decodeURIComponent(data)));
      } catch (e) {
        alert("소셜 정보 파싱에 실패했습니다.");
        router.replace("/login");
      }
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !username.trim()) {
      setError("아이디와 이름을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/social-signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...socialData,
            userId: userId.trim(),
            username: username.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "회원가입에 실패했습니다.");
      }

      // 성공 시 토큰, user 정보 받기
      const result = await response.json();
      setSocialLogin(result);

      // 메인 페이지로 이동
      router.replace("/posts");
    } catch (err: any) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/80 text-white flex items-center justify-center relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 메인 회원가입 카드 */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent mb-2">
              소셜 회원가입
            </h1>
            <p className="text-gray-400">
              추가 정보를 입력하여 회원가입을 완료해주세요
            </p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일과 소셜 제공자는 hidden으로 처리 */}
            <input type="hidden" value={socialData?.email || ""} />
            <input type="hidden" value={socialData?.provider || ""} />

            {/* 아이디 입력 */}
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                사용자 ID (고유값)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">@</span>
                </div>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="사용할 아이디를 입력하세요"
                />
              </div>
            </div>

            {/* 이름 입력 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                사용자명 (표시될 이름)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">👤</span>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="이름을 입력하세요"
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  회원가입 중...
                </div>
              ) : (
                "회원가입 완료하기"
              )}
            </button>
          </form>
        </div>

        {/* 하단 추가 정보 */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            회원가입을 완료하고 블로그를 시작해보세요 ✨
          </p>
        </div>
      </div>
    </div>
  );
}

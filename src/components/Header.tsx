"use client";

import Link from "next/link";
import { useAuthStore } from "../stores/authStore";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading, fetchUserInfo } =
    useAuthStore();

  // 드롭다운 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserInfo();
    }
  }, [isAuthenticated, user, fetchUserInfo]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("auth-storage");
    setIsDropdownOpen(false);
    router.push("/posts");
  };

  const handleDropdownItemClick = (action: () => void) => {
    action();
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      // 🎨 로딩 시에도 어두운 테마 적용
      <header className="bg-transparent border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white">로딩 중...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    // 🎨 투명 배경 + 어두운 테두리
    <header className="bg-transparent border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* 🏠 왼쪽: 홈 버튼 - 흰색 텍스트 */}
          <div>
            <Link
              href="/posts"
              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors font-mono tracking-tight"
            >
              Boolog
            </Link>
          </div>

          {/* 👤 오른쪽: 로그인 상태에 따라 다른 버튼들 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // ✅ 로그인된 상태
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
                >
                  {/* 사용자 아바타 */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(user?.username || user?.userId)
                        ?.charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  {/* 사용자 이름 */}
                  <span className="text-white font-medium">
                    {user?.username || user?.userId}
                  </span>

                  {/* 드롭다운 화살표 */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl rounded-lg border border-gray-700 shadow-2xl z-50">
                    <div className="py-2">
                      {/* 글 작성 */}
                      <button
                        onClick={() =>
                          handleDropdownItemClick(() => router.push("/write"))
                        }
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-black/40 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-green-400">✏️</span>
                        <span>글 작성</span>
                      </button>

                      {/* 내 블로그 */}
                      <button
                        onClick={() =>
                          handleDropdownItemClick(() =>
                            router.push(`/posts/${user?.userId}`)
                          )
                        }
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-black/40 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-blue-400">📝</span>
                        <span>내 블로그</span>
                      </button>

                      {/* 구분선 */}
                      <div className="border-t border-gray-700 my-2"></div>

                      {/* 로그아웃 */}
                      <button
                        onClick={() => handleDropdownItemClick(handleLogout)}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-red-400 hover:bg-black/40 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-red-400">🚪</span>
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ❌ 로그인 안된 상태
              <>
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors border border-blue-500"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

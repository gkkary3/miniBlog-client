"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "../stores/authStore";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { updateUserInfo } from "../lib/userBlogApi";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading, fetchUserInfo } =
    useAuthStore();

  // 드롭다운 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 설정 모달 열기
  const openSettingModal = () => {
    setEditUsername(user?.username || "");
    setEditUserId(user?.userId || "");
    setProfileImage(user?.profileImage || "");
    setIsSettingOpen(true);
  };
  // 설정 모달 닫기
  const closeSettingModal = () => {
    setIsSettingOpen(false);
  };

  // 프로필 이미지 업로드 함수
  const uploadProfileImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await useAuthStore
        .getState()
        .authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
          method: "POST",
          body: formData,
        });

      if (!response.ok) {
        throw new Error("이미지 업로드 실패");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      throw error;
    }
  };

  // 이미지 파일 변경 핸들러
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadProfileImage(file);
        setProfileImage(imageUrl);
      } catch {
        alert("이미지 업로드에 실패했습니다.");
      }
    }
  };

  // 설정 모달 저장 핸들러
  const handleUpdateUser = async () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) throw new Error("로그인 정보가 없습니다.");
      const authData = JSON.parse(authStorage);
      const userPk = authData.state.user?.id;
      if (!userPk) throw new Error("사용자 고유 id를 찾을 수 없습니다.");
      await updateUserInfo(userPk, {
        username: editUsername,
        userId: editUserId,
        profileImage: profileImage,
      });

      authData.state.user = {
        ...authData.state.user,
        username: editUsername,
        userId: editUserId,
        profileImage: profileImage,
      };
      localStorage.setItem("auth-storage", JSON.stringify(authData));

      // 서버에서 최신 데이터 받아와서 상태 갱신
      await fetchUserInfo();

      setIsSettingOpen(false);

      // TODO: 필요시 사용자 정보 새로고침
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        alert((err as { message?: string }).message || "수정에 실패했습니다.");
      } else {
        alert("수정에 실패했습니다.");
      }
    }
  };

  // 🗑️ 회원 탈퇴 핸들러
  const handleDeleteAccount = async () => {
    // 첫 번째 확인
    const firstConfirm = confirm(
      "정말로 회원 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
    );

    if (!firstConfirm) return;

    // 두 번째 확인 (더 강한 경고)
    const secondConfirm = confirm(
      "⚠️ 마지막 확인입니다.\n\n회원 탈퇴를 진행하면:\n- 모든 게시글과 댓글이 삭제됩니다\n- 프로필 정보가 완전히 삭제됩니다\n- 복구가 불가능합니다\n\n정말로 탈퇴하시겠습니까?"
    );

    if (!secondConfirm) return;

    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) throw new Error("로그인 정보가 없습니다.");

      const authData = JSON.parse(authStorage);
      const userPk = authData.state.user?.id;

      if (!userPk) throw new Error("사용자 정보를 찾을 수 없습니다.");

      // 회원 탈퇴 API 호출
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${userPk}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error("회원 탈퇴에 실패했습니다.");
      }

      // 탈퇴 성공 시 로그아웃 처리
      alert("회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");

      // 로그아웃 및 데이터 정리
      await logout();
      localStorage.removeItem("auth-storage");

      // 로그인 페이지로 이동
      setIsSettingOpen(false);
      router.push("/login");
    } catch (err: unknown) {
      console.error("회원 탈퇴 에러:", err);

      if (err && typeof err === "object" && "message" in err) {
        alert(
          (err as { message?: string }).message || "회원 탈퇴에 실패했습니다."
        );
      } else {
        alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    }
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
      <div className="container mx-auto px-4 py-4 max-w-[1400px]">
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
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt="프로필"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(user?.username || user?.userId)
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}

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

                      {/* 설정 */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          openSettingModal();
                        }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-black/40 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-yellow-400">⚙️</span>
                        <span>설정</span>
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
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 설정 모달 */}
      <Modal isOpen={isSettingOpen} onClose={closeSettingModal}>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <h2 className="text-xl font-bold text-white">설정</h2>

          {/* 프로필 이미지 섹션 */}
          <div className="flex flex-col items-center gap-2">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="프로필 미리보기"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {(editUsername || user?.userId)?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-all"
            >
              프로필 사진 변경
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">닉네임</label>
            <input
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
            />
            <label className="text-gray-300 text-sm mt-1">ID</label>
            <input
              className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              value={editUserId}
              onChange={(e) => setEditUserId(e.target.value)}
            />
          </div>

          {/* 🚨 위험한 작업 섹션 */}
          <div className="border-t border-red-900/30 pt-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-1">
                  위험한 작업
                </h3>
                <p className="text-xs text-gray-500">
                  이 작업은 되돌릴 수 없습니다
                </p>
              </div>
              <button
                className="px-3 py-1 text-xs bg-red-900/20 text-red-400 border border-red-900/50 rounded hover:bg-red-900/30 hover:text-red-300 transition-colors"
                onClick={handleDeleteAccount}
              >
                회원 탈퇴
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
              onClick={handleUpdateUser}
            >
              수정
            </button>
            <button
              className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
              onClick={closeSettingModal}
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}

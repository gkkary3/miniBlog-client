"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";

export default function WritePage() {
  // 🆕 URL 파라미터에서 게시글 ID 가져오기
  const searchParams = useSearchParams();
  const postId = searchParams.get("id"); // ?id=2 에서 '2' 추출
  const isEditMode = !!postId; // id가 있으면 수정 모드

  // 📝 입력 상태 관리
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 🆕 페이지 로딩 상태

  // 🏪 Zustand store에서 필요한 것들 가져오기
  const {
    user,
    isAuthenticated,
    createPost,
    updatePost,
    loading: storeLoading,
  } = useAuthStore();
  const router = useRouter();

  // 🔐 로그인 검증
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // 🆕 수정 모드일 때 기존 게시글 데이터 로드
  useEffect(() => {
    if (isEditMode && postId && isAuthenticated) {
      fetchPostData(postId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, postId, isAuthenticated]);

  // 🆕 게시글 데이터 가져오기 함수
  const fetchPostData = async (id: string) => {
    setLoading(true);
    try {
      // 🔍 현재 로그인한 사용자의 게시글만 수정 가능하도록 user.userId 사용
      const response = await fetch(
        `http://localhost:4000/posts/@${user?.userId}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("게시글을 불러올 수 없습니다.");
      }

      const post = await response.json();

      // 📝 폼에 기존 데이터 채우기
      setTitle(post.title);
      setContent(post.content);
      setCategories(
        post.categories?.map(
          (category: { id: number; name: string }) => category.name
        ) || []
      );
    } catch (error) {
      setError("게시글을 불러오는데 실패했습니다.");
      console.error("게시글 로드 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🏷️ 카테고리 입력 처리 (기존과 동일)
  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && categoryInput.trim()) {
      e.preventDefault();
      const newCategory = categoryInput.replace(/^#/, "").trim();
      if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
      }
      setCategoryInput("");
    }
  };

  // 🗑️ 카테고리 삭제 함수 (기존과 동일)
  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
  };

  // 📤 게시글 제출 (작성/수정 분기)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 🔍 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    if (categories.length === 0) {
      setError("최소 1개의 카테고리를 입력해주세요.");
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        categories: categories,
      };

      if (isEditMode && postId) {
        // 🔄 수정 모드
        await updatePost(postId, postData);
        alert("게시글이 수정되었습니다!");
      } else {
        // ➕ 작성 모드
        await createPost(postData);
        alert("게시글이 작성되었습니다!");
      }

      // ✅ 성공 시 게시글 목록으로 이동
      router.push("/posts");
    } catch (error) {
      setError(
        isEditMode
          ? "게시글 수정에 실패했습니다. 다시 시도해주세요."
          : "게시글 작성에 실패했습니다. 다시 시도해주세요."
      );
      console.error(error);
    }
  };

  // ⏳ 로그인 상태 확인 중일 때
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-white">로그인이 필요합니다...</div>
      </div>
    );
  }

  // ⏳ 수정 모드에서 데이터 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-white">게시글 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/80 text-white relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-4xl">{isEditMode ? "✏️" : "📝"}</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
            {isEditMode ? "게시글 수정" : "새 게시글 작성"}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {isEditMode
              ? "멋진 아이디어로 게시글을 더욱 빛나게 만들어보세요 ✨"
              : "당신만의 특별한 이야기를 세상과 나누어보세요 🌟"}
          </p>
        </div>

        {/* 게시글 작성/수정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 카테고리 입력 섹션 */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🏷️</span>
              <h3 className="text-xl font-semibold text-white">
                카테고리 설정
              </h3>
            </div>

            <label className="block text-sm font-medium text-gray-300 mb-4">
              # + 카테고리명을 입력 후 엔터를 눌러주세요
            </label>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500">#</span>
              </div>
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
                placeholder="javascript 입력 후 엔터"
                className="w-full pl-8 pr-4 py-4 bg-black/20 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
              />
            </div>

            {/* 추가된 카테고리들 표시 */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 flex items-center">
                  <span className="mr-2">📌</span>
                  선택된 카테고리
                </p>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium shadow-lg"
                    >
                      #{category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-3 text-green-200 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 제목 입력 */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">📄</span>
              <h3 className="text-xl font-semibold text-white">제목</h3>
            </div>

            <div className="relative">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="멋진 제목을 입력해주세요..."
                className="w-full px-6 py-4 bg-black/20 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <span className="text-gray-500 text-sm">
                  {title.length}/100
                </span>
              </div>
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">📝</span>
              <h3 className="text-xl font-semibold text-white">내용</h3>
            </div>

            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="당신의 이야기를 자유롭게 펼쳐보세요...&#10;&#10;• 마크다운 문법을 사용할 수 있습니다&#10;• 코드 블록, 링크, 이미지 등을 포함해보세요&#10;• 독자들에게 도움이 되는 내용을 작성해주세요"
                rows={20}
                className="w-full px-6 py-4 bg-black/20 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none leading-relaxed"
                style={{ fontSize: "16px", lineHeight: "1.6" }}
              />

              <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-lg">
                <span className="text-gray-400 text-sm flex items-center">
                  <span className="mr-1">📊</span>
                  {content.length} 글자
                </span>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
              <div className="flex items-center">
                <span className="text-red-400 mr-3 text-xl">⚠️</span>
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex justify-center space-x-6 pt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-gray-600/20 text-gray-300 rounded-xl hover:bg-gray-600/40 transition-all duration-300 font-medium border border-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={storeLoading}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            >
              {storeLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>
                    {isEditMode ? "수정 처리 중..." : "작성 처리 중..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{isEditMode ? "✨" : "🚀"}</span>
                  <span>
                    {isEditMode ? "수정 완료하기" : "게시글 발행하기"}
                  </span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* 하단 팁 섹션 */}
        <div className="mt-16 text-center">
          <div className="bg-black/20 rounded-xl p-6 border border-gray-700/30">
            <h4 className="text-lg font-semibold text-blue-400 mb-3">
              💡 작성 팁
            </h4>
            <div className="text-gray-400 text-sm space-y-1">
              <p>• 독자의 시선을 끄는 매력적인 제목을 작성해보세요</p>
              <p>
                • 카테고리를 통해 관련 독자들이 쉽게 찾을 수 있도록 해주세요
              </p>
              <p>• 단락을 나누어 읽기 쉽게 구성해보세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

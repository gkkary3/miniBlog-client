"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import dynamic from "next/dynamic";
import type { TextState, TextAreaTextApi } from "@uiw/react-md-editor";
import Link from "next/link";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-[500px] bg-gray-800 rounded-xl"></div>
      </div>
    ),
  }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WritePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, createPost, updatePost } = useAuthStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  interface PostData {
    title: string;
    content: string;
    categories: string[];
    images: string[];
  }

  // 로그인 체크
  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setInitialLoading(false);
  }, [isAuthenticated, router]);

  // 수정 모드인 경우 게시글 데이터 불러오기
  useEffect(() => {
    const postId = searchParams.get("edit");
    if (postId) {
      setIsEditMode(true);
      fetchPostData(postId);
    } else {
      setInitialLoading(false);
    }
  }, [searchParams]);

  interface Category {
    id: number;
    name: string;
  }

  const fetchPostData = async (id: string) => {
    try {
      if (!user?.userId) {
        setError("사용자 정보를 찾을 수 없습니다.");
        setInitialLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/posts/@${user.userId}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("게시글을 찾을 수 없습니다.");
        } else {
          setError("게시글을 불러오는데 실패했습니다.");
        }
        setInitialLoading(false);
        return;
      }

      const data = await response.json();
      if (!data) {
        setError("게시글 데이터가 없습니다.");
        setInitialLoading(false);
        return;
      }

      // 데이터 유효성 검사
      if (!data.title || !data.content) {
        setError("게시글 데이터가 올바르지 않습니다.");
        setInitialLoading(false);
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setCategories(data.categories?.map((cat: Category) => cat.name) || []);
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("게시글을 불러오는데 실패했습니다.");
    } finally {
      setInitialLoading(false);
    }
  };

  // 초기 로딩 중일 때
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-800 rounded-xl w-1/3"></div>
            <div className="h-64 bg-gray-800 rounded-xl"></div>
            <div className="h-96 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <span className="text-red-400 mr-3 text-xl">⚠️</span>
              <h1 className="text-xl font-bold text-red-400">{error}</h1>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => router.back()}
                className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
              >
                ← 이전 페이지로 돌아가기
              </button>
              <Link
                href="/posts"
                className="block text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center"
              >
                📝 전체 게시글 목록으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 유효성 검사
      if (!title.trim()) {
        setError("제목을 입력해주세요.");
        return;
      }

      if (!content.trim()) {
        setError("내용을 입력해주세요.");
        return;
      }

      const postData: PostData = {
        title: title.trim(),
        content: content.trim(),
        categories: categories,
        images: uploadedImages,
      };

      const editId = searchParams.get("edit");

      if (isEditMode && editId) {
        await updatePost(editId, postData);
        alert("게시글이 수정되었습니다!");
      } else {
        await createPost(postData);
        alert("게시글이 작성되었습니다!");
      }

      router.push("/posts");
    } catch (error) {
      setError(
        isEditMode
          ? "게시글 수정에 실패했습니다. 다시 시도해주세요."
          : "게시글 작성에 실패했습니다. 다시 시도해주세요."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 이미지 업로드 함수
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await useAuthStore
        .getState()
        .authenticatedFetch("http://localhost:4000/upload/image", {
          method: "POST",
          body: formData,
        });

      if (!response.ok) {
        throw new Error("이미지 업로드 실패");
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      // 🆕 업로드된 이미지를 배열에 추가
      setUploadedImages((prev) => [...prev, imageUrl]);

      return imageUrl;
    } catch (error) {
      console.error("이미지 업로드 에러:", error);
      throw error;
    }
  };

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
              <div className="w-full" data-color-mode="dark">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  preview="edit"
                  height={500}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder:
                      "당신의 이야기를 자유롭게 펼쳐보세요...\n\n• 마크다운 문법을 사용할 수 있습니다\n• **굵게**, *기울임*, `코드` 등을 사용해보세요\n• 🖼️ 버튼으로 이미지를 업로드할 수 있습니다",
                    style: {
                      fontSize: 16,
                      lineHeight: "1.6",
                      color: "#f3f4f6",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid #4b5563",
                      borderRadius: "12px",
                    },
                  }}
                  extraCommands={[
                    // 커스텀 이미지 업로드 명령어만 추가
                    {
                      name: "image-upload",
                      keyCommand: "image-upload",
                      buttonProps: {
                        "aria-label": "이미지 업로드",
                        title: "이미지 업로드 (최대 5MB)",
                      },
                      icon: (
                        <div
                          style={{
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center",
                            color: "#f3f4f6",
                          }}
                        >
                          🖼️
                        </div>
                      ),
                      execute: async (
                        state: TextState,
                        api: TextAreaTextApi
                      ) => {
                        // 파일 선택 input 생성
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept =
                          "image/jpeg,image/jpg,image/png,image/gif,image/webp";
                        input.multiple = false;

                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            try {
                              // 이미지 크기 제한 (5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                alert("이미지 크기는 5MB 이하여야 합니다.");
                                return;
                              }

                              // 로딩 표시
                              const loadingText = `![업로드 중...](uploading-${Date.now()})`;
                              api.replaceSelection(loadingText);

                              // 이미지 업로드
                              const imageUrl = await uploadImage(file);

                              // 마크다운 이미지 문법으로 교체
                              const imageMarkdown = `![${file.name}](${imageUrl})`;

                              // 현재 content에서 로딩 텍스트를 찾아서 교체
                              setContent((prev) =>
                                prev.replace(loadingText, imageMarkdown)
                              );

                              console.log("이미지 업로드 성공:", imageUrl);
                            } catch (error) {
                              console.error("이미지 업로드 실패:", error);

                              // 로딩 텍스트 제거 (패턴으로 찾기)
                              setContent((prev) => {
                                const loadingPattern =
                                  /!\[업로드 중\.\.\.\]\(uploading-\d+\)/g;
                                return prev.replace(loadingPattern, "");
                              });

                              alert(
                                "이미지 업로드에 실패했습니다. 네트워크 상태를 확인해주세요."
                              );
                            }
                          }
                        };

                        // 파일 선택 창 열기
                        input.click();
                      },
                    },
                  ]}
                />
              </div>

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
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            >
              {loading ? (
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
};

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-800 rounded-xl w-1/3"></div>
              <div className="h-64 bg-gray-800 rounded-xl"></div>
              <div className="h-96 bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      }
    >
      <WritePageContent />
    </Suspense>
  );
}

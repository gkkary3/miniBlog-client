"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { TextState, TextAreaTextApi } from "@uiw/react-md-editor";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-black/20 border border-gray-600 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">마크다운 에디터 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WritePageContent = () => {
  // URL 파라미터에서 게시글 ID 가져오기
  const searchParams = useSearchParams();
  const postId = searchParams.get("id"); // ?id=2 에서 '2' 추출
  const isEditMode = !!postId; // id가 있으면 수정 모드

  // 입력 상태 관리
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>("");
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
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(`${API_URL}/posts/@${user?.userId}/${id}`);

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
      setThumbnail(post.thumbnail || "");

      // 🆕 기존 이미지들도 로드 (이 부분 추가)
      if (post.images && Array.isArray(post.images)) {
        setUploadedImages(post.images);
      }
    } catch (error) {
      setError("게시글을 불러오는데 실패했습니다.");
      console.error("게시글 로드 에러:", error);
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
        .authenticatedFetch(`${API_URL}/upload/image`, {
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

  // 썸네일 업로드 함수
  const uploadThumbnail = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await useAuthStore
        .getState()
        .authenticatedFetch(`${API_URL}/upload/image`, {
          method: "POST",
          body: formData,
        });

      if (!response.ok) {
        throw new Error("썸네일 업로드 실패");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("썸네일 업로드 에러:", error);
      throw error;
    }
  };

  // 썸네일 파일 선택 핸들러
  const handleThumbnailChange = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    try {
      const imageUrl = await uploadThumbnail(file);
      setThumbnail(imageUrl);
    } catch {
      alert("썸네일 업로드에 실패했습니다.");
    }
  };

  // 드래그앤드롭 핸들러
  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleThumbnailChange(file);
    }
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 썸네일 삭제
  const removeThumbnail = () => {
    setThumbnail("");
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

    // if (categories.length === 0) {
    //   setError("최소 1개의 카테고리를 입력해주세요.");
    //   return;
    // }

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        categories: categories,
        images: uploadedImages,
        thumbnail: thumbnail,
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

      <div className="relative z-10 py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              당신만의 특별한 이야기를 세상과 나누어보세요 🌟
            </p>
          </div>
        </div>

        {/* 게시글 작성/수정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 상단 섹션들 (카테고리, 제목, 썸네일) */}
          <div className="container mx-auto px-4 max-w-3xl space-y-8">
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

            {/* 썸네일 업로드 */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">🖼️</span>
                <h3 className="text-xl font-semibold text-white">
                  썸네일 업로드
                </h3>
              </div>

              {thumbnail ? (
                // 썸네일 미리보기
                <div className="relative inline-block">
                  <img
                    src={thumbnail}
                    alt="썸네일 미리보기"
                    className="w-64 h-40 object-cover rounded-xl border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                // 썸네일 업로드 영역
                <div
                  onDrop={handleThumbnailDrop}
                  onDragOver={handleThumbnailDragOver}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("thumbnail-input")?.click()
                  }
                >
                  <div className="text-gray-400 mb-4">
                    <span className="text-4xl block mb-2">📸</span>
                    <p className="text-lg mb-2">썸네일 이미지를 업로드하세요</p>
                    <p className="text-sm">
                      드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      권장 크기: 1200x630px, 최대 5MB
                      <br />
                      지원 형식: JPG, PNG, GIF, WebP, AVIF
                    </p>
                  </div>

                  <input
                    id="thumbnail-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailChange(file);
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("thumbnail-input")?.click();
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    파일 선택
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 내용 입력 - 헤더와 동일한 width */}
          <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">📝</span>
                <h3 className="text-xl font-semibold text-white">내용</h3>
              </div>

              <div className="relative">
                <div className="w-full">
                  <ErrorBoundary
                    fallback={
                      <div className="w-full h-[600px] bg-red-900/20 border border-red-700/50 rounded-xl flex items-center justify-center">
                        <div className="text-center p-8">
                          <span className="text-red-400 text-4xl block mb-4">
                            ⚠️
                          </span>
                          <h3 className="text-red-400 font-semibold mb-2">
                            에디터 로딩 실패
                          </h3>
                          <p className="text-gray-300 mb-4">
                            마크다운 에디터를 불러오는 중 문제가 발생했습니다.
                          </p>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            페이지 새로고침
                          </button>
                        </div>
                      </div>
                    }
                  >
                    {typeof window !== "undefined" && (
                      <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        preview="live"
                        height={600}
                        visibleDragbar={false}
                        hideToolbar={false}
                        previewOptions={{
                          skipHtml: false,
                        }}
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
                        data-color-mode="dark"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
                          borderRadius: "12px",
                          border: "1px solid #4b5563",
                        }}
                        extraCommands={[
                          {
                            name: "image-upload",
                            keyCommand: "image-upload",
                            buttonProps: {
                              "aria-label": "이미지 업로드",
                              title: "이미지 업로드 (최대 5MB)",
                              style: {
                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                borderRadius: "6px",
                                padding: "8px 12px",
                                minWidth: "48px",
                                minHeight: "40px",
                              },
                            },
                            icon: (
                              <div
                                style={{
                                  fontSize: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  color: "#f3f4f6",
                                  padding: "4px",
                                }}
                              >
                                🖼️
                              </div>
                            ),
                            execute: async (
                              state: TextState,
                              api: TextAreaTextApi
                            ) => {
                              if (typeof window === "undefined") return;

                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept =
                                "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif";
                              input.multiple = false;

                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  try {
                                    if (file.size > 5 * 1024 * 1024) {
                                      alert(
                                        "이미지 크기는 5MB 이하여야 합니다."
                                      );
                                      return;
                                    }

                                    const loadingText = `![업로드 중...](uploading-${Date.now()})`;
                                    api.replaceSelection(loadingText);

                                    const imageUrl = await uploadImage(file);

                                    // 마크다운 형식으로 이미지 삽입
                                    const imageMarkdown = `![${file.name}](${imageUrl})\n\n`;

                                    setContent((prev) =>
                                      prev.replace(loadingText, imageMarkdown)
                                    );

                                    console.log(
                                      "이미지 업로드 성공:",
                                      imageUrl
                                    );
                                    console.log(
                                      "이미지 마크다운:",
                                      imageMarkdown
                                    );

                                    // 이미지 URL 접근 가능한지 테스트
                                    fetch(imageUrl, { method: "HEAD" })
                                      .then((response) => {
                                        console.log(
                                          "이미지 URL 테스트 성공:",
                                          response.status
                                        );
                                        console.log(
                                          "Content-Type:",
                                          response.headers.get("Content-Type")
                                        );
                                      })
                                      .catch((error) => {
                                        console.log(
                                          "이미지 URL 테스트 실패:",
                                          error
                                        );
                                      });
                                  } catch (error) {
                                    console.error("이미지 업로드 실패:", error);
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

                              input.click();
                            },
                          },
                        ]}
                      />
                    )}
                  </ErrorBoundary>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-lg">
                  <span className="text-gray-400 text-sm flex items-center">
                    <span className="mr-1">📊</span>
                    {content.length} 글자
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                <div className="flex items-center">
                  <span className="text-red-400 mr-3 text-xl">⚠️</span>
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="container mx-auto px-4 max-w-3xl">
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
                    <span>{isEditMode ? "✨" : ""}</span>
                    <span>{isEditMode ? "수정 완료하기" : "게시글 작성"}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
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

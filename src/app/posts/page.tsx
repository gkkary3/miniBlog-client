"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useInfiniteSearch, SortType } from "../../hooks/useInfiniteSearch";
import { SearchPost } from "../../types/post";
import { PostListSkeleton } from "../../components/Skeleton";
import SEO from "../../components/SEO";

export default function PostsPage() {
  const router = useRouter();

  // 검색 input ref (포커스 유지를 위함)
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    posts,
    loading,
    hasMore,
    error,
    searchInput,
    searchQuery,
    sortBy,
    setSortBy,
    setSearchInput,
    resetSearch,
    lastElementRef,
  } = useInfiniteSearch(10);

  // 마크다운 문법 제거 및 텍스트 추출 함수
  const stripMarkdown = (markdown: string): string => {
    return (
      markdown
        // 이미지 제거 ![alt](url)
        .replace(/!\[.*?\]\(.*?\)/g, "")
        // 링크를 텍스트만 남기기 [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // 헤더 제거 # ## ###
        .replace(/^#{1,6}\s+/gm, "")
        // 볼드, 이탤릭 제거 **text** *text*
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        // 코드 블록 제거 ```code```
        .replace(/```[\s\S]*?```/g, "")
        // 인라인 코드 제거 `code`
        .replace(/`([^`]+)`/g, "$1")
        // 인용 블록 제거 >
        .replace(/^>\s+/gm, "")
        // 리스트 마커 제거 - * +
        .replace(/^[\s]*[-*+]\s+/gm, "")
        // 숫자 리스트 제거 1. 2.
        .replace(/^[\s]*\d+\.\s+/gm, "")
        // 여러 줄바꿈을 하나로
        .replace(/\n\s*\n/g, "\n")
        // 앞뒤 공백 제거
        .trim()
    );
  };

  // 게시글 내용에서 첫 번째 이미지 URL 추출 함수
  const extractFirstImage = (content: string): string | null => {
    // 마크다운 이미지 문법 ![alt](url) 매칭
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = content.match(imageRegex);
    return match ? match[1] : null;
  };

  const handlePostClick = (post: SearchPost) => {
    router.push(`/posts/${post.user.userId}/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    router.push(`/posts/${userId}`);
  };

  // 검색 input 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 검색 중에도 포커스 유지
  useEffect(() => {
    if (
      searchInputRef.current &&
      document.activeElement !== searchInputRef.current
    ) {
      // 검색 중이면서 다른 요소에 포커스가 있을 때만 포커스 복원
      if (searchInput && loading) {
        searchInputRef.current.focus();
      }
    }
  }, [loading, searchInput]);

  return (
    <>
      <SEO
        title="게시글 목록"
        description="다양한 개발자들의 기술 블로그와 프로젝트를 확인해보세요. 최신 개발 트렌드와 유용한 정보를 공유합니다."
        keywords={["게시글", "블로그", "개발", "기술", "프로젝트"]}
        url="/posts"
      />
      <div className="min-h-screen bg-black/80 text-white">
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
          {/* 헤더 */}
          <div className="text-center mb-12 relative">
            {/* 백그라운드 패턴 - 상단만 */}
            <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden rounded-3xl -z-10">
              {/* 검은색 배경 */}
              <div className="absolute inset-0 bg-black/80"></div>

              {/* 플로팅 카드들 - 블로그 포스트를 연상시키는 카드들 (매우 진하게) */}
              <div
                className="absolute top-4 left-8 w-16 h-12 bg-gradient-to-br from-white/80 to-white/60 rounded-lg backdrop-blur-sm border-2 border-white/80 transform rotate-12 animate-bounce shadow-2xl"
                style={{ animationDelay: "0s", animationDuration: "3s" }}
              ></div>
              <div
                className="absolute top-12 right-12 w-20 h-14 bg-gradient-to-br from-blue-400/80 to-cyan-400/60 rounded-lg backdrop-blur-sm border-2 border-blue-300/80 transform -rotate-6 animate-pulse shadow-2xl"
                style={{ animationDelay: "1s", animationDuration: "4s" }}
              ></div>
              <div
                className="absolute bottom-8 left-16 w-18 h-13 bg-gradient-to-br from-emerald-400/80 to-teal-400/60 rounded-lg backdrop-blur-sm border-2 border-emerald-300/80 transform rotate-3 animate-bounce shadow-2xl"
                style={{ animationDelay: "2s", animationDuration: "5s" }}
              ></div>
              <div
                className="absolute bottom-16 right-8 w-14 h-10 bg-gradient-to-br from-violet-400/80 to-purple-400/60 rounded-lg backdrop-blur-sm border-2 border-violet-300/80 transform -rotate-12 animate-pulse shadow-2xl"
                style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
              ></div>
              <div
                className="absolute top-20 left-1/2 w-12 h-16 bg-gradient-to-br from-rose-400/80 to-pink-400/60 rounded-lg backdrop-blur-sm border-2 border-rose-300/80 transform rotate-45 animate-bounce shadow-2xl"
                style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
              ></div>
              <div
                className="absolute top-8 left-1/3 w-10 h-8 bg-gradient-to-br from-amber-400/80 to-orange-400/60 rounded-lg backdrop-blur-sm border-2 border-amber-300/80 transform -rotate-30 animate-pulse shadow-2xl"
                style={{ animationDelay: "2.5s", animationDuration: "6s" }}
              ></div>
              <div
                className="absolute bottom-12 right-1/3 w-16 h-11 bg-gradient-to-br from-indigo-400/80 to-blue-400/60 rounded-lg backdrop-blur-sm border-2 border-indigo-300/80 transform rotate-18 animate-bounce shadow-2xl"
                style={{ animationDelay: "0.8s", animationDuration: "3.8s" }}
              ></div>

              {/* 떠다니는 글자들 - 블로그 키워드 (매우 진하게) */}
              <div
                className="absolute top-6 right-20 text-white text-sm font-bold transform rotate-12 animate-pulse bg-black/30 px-2 py-1 rounded-md"
                style={{ animationDelay: "1s", animationDuration: "2s" }}
              >
                Blog
              </div>
              <div
                className="absolute bottom-6 left-12 text-white text-sm font-bold transform -rotate-6 animate-pulse bg-black/30 px-2 py-1 rounded-md"
                style={{ animationDelay: "2s", animationDuration: "3s" }}
              >
                Write
              </div>
              <div
                className="absolute top-16 left-1/4 text-white text-sm font-bold transform rotate-30 animate-pulse bg-black/30 px-2 py-1 rounded-md"
                style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
              >
                Story
              </div>
              <div
                className="absolute bottom-20 right-1/4 text-white text-sm font-bold transform -rotate-15 animate-pulse bg-black/30 px-2 py-1 rounded-md"
                style={{ animationDelay: "1.8s", animationDuration: "4s" }}
              >
                Share
              </div>

              {/* 배경 오버레이 (검은색으로 조정) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15"></div>
            </div>

            {/* 컨텐츠 */}
            <div className="relative z-20 py-12">
              {/* 장식 요소 */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-purple-400/80"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/60"></div>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-purple-400/80"></div>
              </div>
            </div>

            {/* 필터와 검색 컨테이너 (항상 표시) */}
            <div className="mb-6 relative z-30">
              <div className="flex items-center justify-between">
                {/* 왼쪽: 정렬 필터 버튼들 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy(SortType.LATEST)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortBy === SortType.LATEST
                        ? "text-white bg-gray-700/70"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSortBy(SortType.LIKES)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortBy === SortType.LIKES
                        ? "text-white bg-gray-700/70"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    좋아요순
                  </button>
                  <button
                    onClick={() => setSortBy(SortType.COMMENTS)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortBy === SortType.COMMENTS
                        ? "text-white bg-gray-700/70"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    댓글순
                  </button>
                </div>

                {/* 오른쪽: 검색 */}
                <div className="hidden md:block">
                  <div className="flex gap-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchInput}
                      onChange={handleSearchChange}
                      placeholder="검색..."
                      className="w-48 px-3 py-2 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={resetSearch}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors text-sm"
                        title="검색 초기화"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 검색 결과 정보 */}
            {searchQuery && (
              <div className="text-center mb-8">
                <p className="text-gray-400">
                  &ldquo;
                  <span className="text-blue-400 font-semibold">
                    {searchQuery}
                  </span>
                  &rdquo; 검색 결과
                  {loading && (
                    <span className="ml-2 text-gray-400">(검색 중...)</span>
                  )}
                </p>
                {posts.length > 0 && (
                  <p className="text-gray-500 mt-2">
                    {posts.length}개의 결과를 찾았습니다
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 모바일 검색 폼 - 게시글 바로 위에 배치 */}
          <div className="md:hidden mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="검색어를 입력하세요..."
                  autoFocus
                  className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  title="검색 초기화"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 text-xl mb-2">❌ {error}</div>
              <button
                onClick={resetSearch}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                다시 시도하기
              </button>
            </div>
          )}

          {/* 게시글 목록 */}
          {!error && (
            <>
              {loading && posts.length === 0 ? (
                <PostListSkeleton count={8} />
              ) : posts.length === 0 && searchQuery && !loading ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-400 text-xl mb-2">
                    검색 결과가 없습니다.
                  </p>
                  <p className="text-gray-500">다른 검색어로 시도해보세요.</p>
                </div>
              ) : posts.length === 0 && !searchQuery && !loading ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-400 text-xl mb-2">
                    게시글이 없습니다.
                  </p>
                  <p className="text-gray-500">
                    첫 번째 게시글을 작성해보세요!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {posts.map((post, index) => (
                    <article
                      key={post.id}
                      ref={index === posts.length - 1 ? lastElementRef : null}
                      onClick={() => handlePostClick(post)}
                      className="group bg-black/40 rounded-xl p-6 hover:bg-black/60 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1 flex flex-col h-full"
                    >
                      {/* 썸네일 이미지 */}
                      <div className="mb-4 w-full h-48 rounded-lg overflow-hidden">
                        {post.thumbnail ? (
                          <Image
                            src={post.thumbnail}
                            alt={`${post.title} 썸네일`}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (() => {
                            // 게시글 내용에서 첫 번째 이미지 추출
                            const firstImage = extractFirstImage(post.content);

                            if (firstImage) {
                              // 첫 번째 이미지가 있으면 이미지 표시
                              return (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={firstImage}
                                    alt={`${post.title} 첫 번째 이미지`}
                                    width={400}
                                    height={200}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                    내용 이미지
                                  </div>
                                </div>
                              );
                            } else {
                              // 이미지가 없으면 텍스트 미리보기 표시
                              return (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 flex items-center justify-center border border-gray-700/50 relative overflow-hidden">
                                  {/* 배경 패턴 */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
                                  <div className="absolute top-2 right-2 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded">
                                    미리보기
                                  </div>

                                  {/* 게시글 내용 미리보기 */}
                                  <div className="relative z-10 p-4 w-full h-full flex flex-col justify-center">
                                    <div className="text-gray-300 text-sm leading-relaxed line-clamp-6 text-center">
                                      {(() => {
                                        const cleanContent = stripMarkdown(
                                          post.content
                                        );
                                        return cleanContent.length > 200
                                          ? cleanContent.substring(0, 200) +
                                              "..."
                                          : cleanContent || "내용이 없습니다.";
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })()
                        )}
                      </div>

                      {/* 게시글 헤더 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {post.user.profileImage ? (
                            <Image
                              src={post.user.profileImage}
                              alt={`${
                                post.user.username || post.user.userId
                              } 프로필`}
                              width={40}
                              height={40}
                              className="rounded-full object-cover cursor-pointer"
                              onClick={(e) =>
                                handleAuthorClick(e, post.user.userId)
                              }
                              title={post.user.username}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
                              onClick={(e) =>
                                handleAuthorClick(e, post.user.userId)
                              }
                              title={post.user.username}
                            >
                              {post.user.username
                                ? post.user.username.charAt(0).toUpperCase()
                                : post.user.userId.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span
                              className="text-blue-400 font-medium cursor-pointer hover:underline"
                              onClick={(e) =>
                                handleAuthorClick(e, post.user.userId)
                              }
                            >
                              {post.user.username || post.user.userId}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              by {post.user.userId}
                            </span>
                            <p className="text-gray-500 text-xs">
                              {new Date(post.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-gray-400">
                          <span className="text-red-400">❤️</span>
                          <span className="text-sm">
                            {post.likedUsers.length}
                          </span>
                        </div>
                      </div>

                      {/* 게시글 제목 */}
                      <h2 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* 게시글 내용 미리보기 */}
                      <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                        {post.content.length > 120
                          ? post.content.substring(0, 120) + "..."
                          : post.content}
                      </p>

                      {/* 여백 확장 영역 */}
                      <div className="flex-grow"></div>

                      {/* 카테고리 표시 - 맨 아래 고정 */}
                      <div className="h-12 flex items-start mb-4 mt-auto">
                        {post.categories && post.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {post.categories.map((category) => (
                              <span
                                key={category.id}
                                className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs">
                            카테고리 없음
                          </div>
                        )}
                      </div>

                      {/* 푸터 - 맨 아래 고정 */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <span className="text-blue-400">💬</span>
                            <span>{post.comments.length}</span>
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                          자세히 보기 →
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* 로딩 인디케이터 */}
              {loading && posts.length > 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">
                    더 많은 게시글 불러오는 중...
                  </p>
                </div>
              )}

              {/* 더 이상 로드할 항목이 없을 때 */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center mt-12">
                  <div className="inline-flex items-center space-x-2 text-gray-400">
                    <span>🎉</span>
                    <span>
                      {searchQuery
                        ? "모든 검색 결과를 확인했습니다"
                        : "모든 게시글을 확인했습니다"}
                    </span>
                    <span>🎉</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

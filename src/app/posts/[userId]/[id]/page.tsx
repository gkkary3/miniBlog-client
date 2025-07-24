"use client";

import { useEffect, useState } from "react";
import { use } from "react"; // Next.js 15에서 추가
import Link from "next/link";
import Image from "next/image";
import { Post } from "../../../../types/post";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import CommentSection from "@/components/Comments";
import SafeMarkdownRenderer from "@/components/SafeMarkdownRenderer";
import { PostDetailSkeleton } from "@/components/Skeleton";
import SEO from "@/components/SEO";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ userId: string; id: string }>; // Promise 타입으로 변경
}) {
  // params Promise를 unwrap
  const resolvedParams = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // 🆕 낙관적 업데이트를 위한 상태
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number | null>(
    null
  );
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // 게시글 데이터 fetch
  useEffect(() => {
    async function fetchPostDetail() {
      try {
        const response = await fetch(
          `${API_URL}/posts/@${resolvedParams.userId}/${resolvedParams.id}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch post detail");

        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post detail:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPostDetail();
  }, [resolvedParams.userId, resolvedParams.id]); // resolvedParams 사용

  // localStorage에서 사용자 정보 가져오기
  useEffect(() => {
    const userInfo = localStorage.getItem("auth-storage");
    const userInfoParsed = JSON.parse(userInfo || "{}");
    const currentUserIdValue = userInfoParsed?.state?.user?.id;
    if (currentUserIdValue && isAuthenticated) {
      setCurrentUserId(parseInt(currentUserIdValue));
    }
  }, [isAuthenticated]);

  // 좋아요 처리 함수 (낙관적 업데이트)
  const handleLike = async () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!currentUserId || !post) return;

    // 🆕 낙관적 업데이트: 즉시 UI 변경
    const originalLiked =
      optimisticLiked !== null
        ? optimisticLiked
        : post.likedUsers.some((user) => user.id === currentUserId);
    const originalCount =
      optimisticLikeCount !== null
        ? optimisticLikeCount
        : post.likedUsers.length;

    setOptimisticLiked(true);
    setOptimisticLikeCount(originalCount + 1);

    try {
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(
          `${API_URL}/posts/@${resolvedParams.userId}/${post.id}/like`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: post.id,
            }),
          }
        );

      if (!response.ok) throw new Error("Failed to like post");

      // 서버 응답 성공 시 실제 데이터로 업데이트
      const updatedResponse = await fetch(
        `${API_URL}/posts/@${resolvedParams.userId}/${resolvedParams.id}`
      );
      const updatedPost = await updatedResponse.json();
      setPost(updatedPost);
      // 낙관적 상태 초기화
      setOptimisticLiked(null);
      setOptimisticLikeCount(null);
    } catch (error) {
      console.error("Error liking post:", error);
      // 🆕 실패 시 원래 상태로 롤백
      setOptimisticLiked(originalLiked);
      setOptimisticLikeCount(originalCount);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  // 좋아요 취소 함수 (낙관적 업데이트)
  const handleUnlike = async () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (!currentUserId || !post) return;

    // 🆕 낙관적 업데이트: 즉시 UI 변경
    const originalLiked =
      optimisticLiked !== null
        ? optimisticLiked
        : post.likedUsers.some((user) => user.id === currentUserId);
    const originalCount =
      optimisticLikeCount !== null
        ? optimisticLikeCount
        : post.likedUsers.length;

    setOptimisticLiked(false);
    setOptimisticLikeCount(originalCount - 1);

    try {
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(
          `${API_URL}/posts/@${resolvedParams.userId}/${post.id}/like`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: post.id,
            }),
          }
        );

      if (!response.ok) throw new Error("Failed to unlike post");

      // 서버 응답 성공 시 실제 데이터로 업데이트
      const updatedResponse = await fetch(
        `${API_URL}/posts/@${resolvedParams.userId}/${resolvedParams.id}`
      );
      const updatedPost = await updatedResponse.json();
      setPost(updatedPost);
      // 낙관적 상태 초기화
      setOptimisticLiked(null);
      setOptimisticLikeCount(null);
    } catch (error) {
      console.error("Error unliking post:", error);
      // 🆕 실패 시 원래 상태로 롤백
      setOptimisticLiked(originalLiked);
      setOptimisticLikeCount(originalCount);
      alert("좋아요 취소에 실패했습니다.");
    }
  };

  const handleDelete = async (postId: number) => {
    if (!isAuthenticated) {
      router.push("/login");
    }
    if (!currentUserId || !post) return;

    try {
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(
          `${API_URL}/posts/@${resolvedParams.userId}/${postId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      if (!response.ok) throw new Error("Failed to delete post");
      alert("게시글이 삭제되었습니다.");
      router.push(`/posts/${resolvedParams.userId}`); // 사용자 블로그로 이동
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // 현재 사용자가 좋아요를 눌렀는지 확인 (낙관적 업데이트 반영)
  const isLiked =
    optimisticLiked !== null
      ? optimisticLiked
      : post?.likedUsers.some((likedUser) => likedUser.id === currentUserId);

  // 좋아요 개수 (낙관적 업데이트 반영)
  const likeCount =
    optimisticLikeCount !== null
      ? optimisticLikeCount
      : post?.likedUsers.length || 0;

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black/80 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            게시글을 찾을 수 없습니다
          </h1>
          <div className="space-y-2">
            <Link
              href="/posts"
              className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
            >
              ← 전체 게시글 목록으로 돌아가기
            </Link>
            <br />
            <Link
              href={`/posts/${resolvedParams.userId}`}
              className="text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center"
            >
              📝 {resolvedParams.userId}님의 블로그 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.content.substring(0, 160) + "..."}
        keywords={["블로그", "개발", "게시글", post.user.username]}
        url={`/posts/${resolvedParams.userId}/${resolvedParams.id}`}
        type="article"
        author={post.user.username}
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
      />
      <div className="min-h-screen bg-black/80 text-white">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-5xl">
          {/* 네비게이션 */}
          <div className="hidden flex items-center justify-between mb-8">
            <Link
              href="/posts"
              className="text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center text-sm"
            >
              ← 전체 게시글 목록
            </Link>
          </div>

          {/* 게시글 카드 */}
          <article className="bg-black/40 rounded-lg p-3 sm:p-8 mb-4 sm:mb-8">
            {/* 작성자 정보 */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 p-2 sm:p-4 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-4">
                {post.user.profileImage ? (
                  <Image
                    src={post.user.profileImage}
                    alt={`${post.user.username} 프로필`}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {post.user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/posts/${resolvedParams.userId}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-semibold text-lg hover:underline cursor-pointer"
                  >
                    {post.user.username}
                  </Link>
                  <p className="text-gray-400 text-sm">
                    📅{" "}
                    {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* 수정/삭제 버튼 - 작성자만 보이도록 */}
              {isAuthenticated && post?.userId === currentUserId && (
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400">
                  <button
                    onClick={() => router.push(`/write?id=${post.id}`)}
                    className="hover:text-blue-400 transition-colors px-1 sm:px-2 py-1 whitespace-nowrap"
                  >
                    수정
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="hover:text-red-400 transition-colors px-1 sm:px-2 py-1 whitespace-nowrap"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
            {/* 게시글 제목 */}
            <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-white leading-tight">
              {post.title}
            </h1>

            {/* 좋아요 버튼 - 개선된 hover 및 낙관적 업데이트 */}
            <div className="flex items-center space-x-4 mb-4 sm:mb-8 pb-3 sm:pb-6 border-b border-gray-700">
              <button
                onClick={isLiked ? handleUnlike : handleLike}
                className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm transform hover:scale-105 ${
                  isLiked
                    ? "text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40"
                    : "text-gray-400 hover:text-red-400 bg-gray-800/50 hover:bg-red-500/10 border border-gray-600/30 hover:border-red-500/30"
                }`}
                disabled={
                  optimisticLiked !== null || optimisticLikeCount !== null
                }
              >
                <span
                  className={`text-base transition-transform duration-300 ${
                    isLiked ? "animate-pulse" : "group-hover:scale-110"
                  }`}
                >
                  {isLiked ? "❤️" : "🤍"}
                </span>
                <span className="font-medium">{likeCount}</span>
                <span className="text-xs opacity-70">
                  {isLiked ? "좋아요 취소" : "좋아요"}
                </span>
              </button>
            </div>

            {/* 게시글 내용 */}
            {/* <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
              {post.content}
            </div>
          </div> */}

            {/* 썸네일 이미지 */}
            {post.thumbnail && (
              <div className="mb-4 sm:mb-8">
                <Image
                  src={post.thumbnail}
                  alt={`${post.title} 썸네일`}
                  width={600}
                  height={300}
                  className="w-full max-w-2xl mx-auto rounded-xl object-cover shadow-lg"
                  priority
                />
              </div>
            )}
            {/* // 🆕 마크다운 렌더링 */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 sm:p-8 border border-gray-700/50 shadow-2xl mb-4 sm:mb-8">
              <SafeMarkdownRenderer
                source={post.content}
                style={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  padding: 0,
                  border: "none",
                  minHeight: "200px",
                }}
              />
            </div>
          </article>

          {/* 댓글 섹션 */}
          <div className="bg-black/40 rounded-lg p-3 sm:p-8">
            <CommentSection
              userId={resolvedParams.userId}
              postId={resolvedParams.id}
            />
          </div>
        </div>
      </div>
    </>
  );
}

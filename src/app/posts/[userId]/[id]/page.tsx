"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Post } from "../../../../types/post";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import CommentSection from "@/components/Comments";
import MDEditor from "@uiw/react-md-editor";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PostDetailPage({
  params,
}: {
  params: { userId: string; id: string };
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // 게시글 데이터 fetch
  useEffect(() => {
    async function fetchPostDetail() {
      try {
        const response = await fetch(
          `${API_URL}/posts/@${params.userId}/${params.id}`,
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
  }, [params.userId, params.id]);

  // localStorage에서 사용자 정보 가져오기
  useEffect(() => {
    const userInfo = localStorage.getItem("auth-storage");
    const userInfoParsed = JSON.parse(userInfo || "{}");
    const currentUserIdValue = userInfoParsed?.state?.user?.id;
    if (currentUserIdValue && isAuthenticated) {
      setCurrentUserId(parseInt(currentUserIdValue));
    }
  }, [isAuthenticated]);

  // 좋아요 처리 함수
  const handleLike = async () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!currentUserId || !post) return;

    try {
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(
          `${API_URL}/posts/@${params.userId}/${post.id}/like`,
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

      // 게시글 데이터 다시 fetch
      const updatedResponse = await fetch(
        `${API_URL}/posts/@${params.userId}/${params.id}`
      );
      const updatedPost = await updatedResponse.json();
      setPost(updatedPost);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // 좋아요 취소 함수
  const handleUnlike = async () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (!currentUserId || !post) return;

    try {
      const response = await useAuthStore
        .getState()
        .authenticatedFetch(
          `${API_URL}/posts/@${params.userId}/${post.id}/like`,
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

      // 게시글 데이터 다시 fetch
      const updatedResponse = await fetch(
        `${API_URL}/posts/@${params.userId}/${params.id}`
      );
      const updatedPost = await updatedResponse.json();
      setPost(updatedPost);
    } catch (error) {
      console.error("Error unliking post:", error);
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
        .authenticatedFetch(`${API_URL}/posts/@${params.userId}/${postId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

      if (!response.ok) throw new Error("Failed to delete post");
      alert("게시글이 삭제되었습니다.");
      router.push(`/posts/${params.userId}`); // 사용자 블로그로 이동
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // 현재 사용자가 좋아요를 눌렀는지 확인 (null 체크 추가)
  const isLiked = post?.likedUsers.some(
    (likedUser) => likedUser.id === currentUserId
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black/80 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>게시글 로딩 중...</p>
        </div>
      </div>
    );
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
              href={`/posts/${params.userId}`}
              className="text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center"
            >
              📝 {params.userId}님의 블로그 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/80 text-white">
      <div className="container mx-auto px-4 py-8">
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
        <article className="bg-black/40 rounded-lg p-8 mb-8">
          {/* 작성자 정보 */}
          <div className="flex items-center justify-between mb-6 p-4 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {post.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <Link
                  href={`/posts/${params.userId}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-semibold text-lg hover:underline cursor-pointer"
                >
                  {post.username}
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
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <button
                  onClick={() => router.push(`/write?id=${post.id}`)}
                  className="hover:text-blue-400 transition-colors px-2 py-1"
                >
                  수정
                </button>
                <span className="text-gray-600">|</span>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="hover:text-red-400 transition-colors px-2 py-1"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          {/* 게시글 제목 */}
          <h1 className="text-4xl font-bold mb-8 text-white">{post.title}</h1>
          {/* 좋아요 버튼 - 간단하게 */}
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-700">
            <button
              onClick={isLiked ? handleUnlike : handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                isLiked
                  ? "text-red-400 hover:text-red-300"
                  : "text-gray-400 hover:text-red-400"
              }`}
            >
              <span className="text-base">{isLiked ? "❤️" : "🤍"}</span>
              <span>{post.likedUsers.length}</span>
            </button>
          </div>
          {/* 게시글 내용 */}
          {/* <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
              {post.content}
            </div>
          </div> */}
          {/* // 🆕 마크다운 렌더링 */}
          <div className="prose prose-invert max-w-none">
            <div className="w-full" data-color-mode="dark">
              <MDEditor.Markdown
                source={post.content}
                style={{
                  backgroundColor: "transparent",
                  color: "#f3f4f6",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #374151",
                  minHeight: "200px",
                }}
              />
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <div className="bg-black/40 rounded-lg p-8">
          <CommentSection userId={params.userId} postId={params.id} />
        </div>
      </div>
    </div>
  );
}

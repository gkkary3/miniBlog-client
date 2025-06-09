"use client";

import { useEffect, useState } from "react";
import { Post } from "../../types/post";
import { useRouter } from "next/navigation";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 클라이언트에서 데이터 fetch
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("http://localhost:4000/posts", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handlePostClick = (post: Post) => {
    router.push(`/posts/${post.user.userId}/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // 게시글 클릭 이벤트 방지
    router.push(`/posts/${userId}`);
  };

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

  return (
    <div className="min-h-screen bg-black/80 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ✨ 모든 블로그 게시글
          </h1>
          <p className="text-gray-400 text-lg">
            다양한 작성자들의 흥미로운 이야기를 만나보세요
          </p>
          {posts.length > 0 && (
            <div className="mt-4 text-gray-500">
              총{" "}
              <span className="text-blue-400 font-semibold">
                {posts.length}
              </span>
              개의 게시글
            </div>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 text-xl mb-2">
              아직 작성된 게시글이 없습니다.
            </p>
            <p className="text-gray-500">첫 번째 게시글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="group bg-black/40 rounded-xl p-6 hover:bg-black/60 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1"
              >
                {/* 게시글 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.user.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button
                        onClick={(e) => handleAuthorClick(e, post.user.userId)}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        {post.user.userId}
                      </button>
                      <p className="text-gray-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>

                  {/* 좋아요 수 */}
                  <div className="flex items-center space-x-1 text-gray-400">
                    <span className="text-red-400">❤️</span>
                    <span className="text-sm">{post.likedUsers.length}</span>
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

                {/* 푸터 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span className="text-blue-400">💬</span>
                      <span>{post.likedUsers.length}</span>
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

        {/* 추가 섹션 - 게시글이 많을 때 */}
        {posts.length > 6 && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 text-gray-400">
              <span>🎉</span>
              <span>모든 게시글을 보고 계십니다</span>
              <span>🎉</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

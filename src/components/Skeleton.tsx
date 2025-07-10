// 스켈레톤 UI 컴포넌트들
export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-800/50 rounded-lg ${className}`}></div>
);

// 게시글 카드 스켈레톤
export const PostCardSkeleton = () => (
  <div className="bg-black/40 rounded-xl p-6 border border-gray-800">
    {/* 썸네일 */}
    <Skeleton className="w-full h-48 mb-4" />

    {/* 헤더 */}
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="w-24 h-4 mb-2" />
        <Skeleton className="w-32 h-3" />
      </div>
    </div>

    {/* 제목 */}
    <Skeleton className="w-full h-6 mb-3" />

    {/* 내용 */}
    <div className="space-y-2 mb-4">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-4/5 h-4" />
      <Skeleton className="w-3/5 h-4" />
    </div>

    {/* 카테고리 */}
    <div className="flex gap-2 mb-4">
      <Skeleton className="w-16 h-6 rounded-full" />
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>

    {/* 푸터 */}
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-20 h-4" />
    </div>
  </div>
);

// 게시글 목록 스켈레톤
export const PostListSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <PostCardSkeleton key={index} />
    ))}
  </div>
);

// 게시글 상세 스켈레톤
export const PostDetailSkeleton = () => (
  <div className="min-h-screen bg-black/80 text-white">
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-black/40 rounded-lg p-8 mb-8">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-black/20 rounded-lg">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>

        {/* 제목 */}
        <Skeleton className="w-full h-10 mb-8" />

        {/* 좋아요 */}
        <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>

        {/* 썸네일 */}
        <Skeleton className="w-full max-w-2xl mx-auto h-80 mb-8" />

        {/* 내용 */}
        <div className="space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/5 h-4" />
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-black/40 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-8 h-6 rounded-full" />
        </div>

        {/* 댓글 작성 폼 */}
        <div className="bg-black/40 p-6 rounded-xl border border-gray-600/50 mb-6">
          <Skeleton className="w-full h-24 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4 p-6 bg-black/40 rounded-xl">
              <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 사용자 블로그 스켈레톤
export const UserBlogSkeleton = () => (
  <div className="min-h-screen bg-black/80 text-white">
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <Skeleton className="w-48 h-8 mb-2" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-20 h-5" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-28 h-5" />
          </div>
          <Skeleton className="w-64 h-10 rounded-lg" />
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-black/40 rounded-lg p-6">
            <Skeleton className="w-full h-48 mb-4" />
            <Skeleton className="w-full h-6 mb-3" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-4/5 h-4" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-12 h-4" />
              </div>
              <Skeleton className="w-20 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black/80 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-400 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/posts"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            🏠 홈으로 돌아가기
          </Link>

          <div className="flex justify-center space-x-4 mt-6">
            <Link
              href="/posts"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              📝 게시글 목록
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              🔐 로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

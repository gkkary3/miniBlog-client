import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface UserListItemProps {
  user: {
    id: number;
    userId: string;
    username: string;
    isFollowing?: boolean;
  };
  isFollowing: boolean;
  onFollowToggle: (userId: string, willFollow: boolean) => Promise<void>;
  currentUserId: number | null; // 현재 로그인한 사용자의 ID
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isFollowing,
  onFollowToggle,
  currentUserId,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 현재 로그인한 사용자와 동일한 사용자인지 체크
  const isSelf = currentUserId === Number(user.id);
  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/posts/${user.userId}`);
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onFollowToggle(user.userId, !isFollowing);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article
      onClick={handleUserClick}
      className="flex items-center gap-3 p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-600"
    >
      {/* 프로필 이니셜 */}
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {user.username.charAt(0).toUpperCase()}
      </div>

      {/* 사용자 정보 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-medium">{user.username}</span>
          <span className="text-xs text-gray-400">by {user.userId}</span>
        </div>
      </div>

      {/* 팔로우 버튼 (자기 자신이 아닐 때만 표시) */}
      {!isSelf && (
        <button
          onClick={handleFollowClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isLoading}
          className={`
            px-4 py-1 rounded-full text-sm font-semibold transition-all
            ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : isFollowing
                ? isHovered
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-gray-800"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : isFollowing ? (
            isHovered ? (
              "해제"
            ) : (
              "팔로잉"
            )
          ) : (
            "팔로우"
          )}
        </button>
      )}
    </article>
  );
};

export default UserListItem;

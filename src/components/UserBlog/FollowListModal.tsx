import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import UserListItem from "./UserListItem";
import { getAuthToken } from "@/lib/commentApi";

interface FollowUser {
  id: number;
  userId: string;
  username: string;
  isFollowing: boolean;
  // profileImage?: string; // posts/page.tsx 스타일이면 필요 없음
}

interface FollowListModalProps {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FollowListModal: React.FC<FollowListModalProps> = ({
  userId,
  type,
  onClose,
}) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const authStorage = localStorage.getItem("auth-storage");
        console.log(authStorage);
        let currentUserId: number | null = null;

        if (authStorage) {
          const authData = JSON.parse(authStorage);
          currentUserId = authData.state.user?.id;
          setCurrentUserId(currentUserId);
        }

        const queryParams = currentUserId
          ? `?currentUserId=${currentUserId}`
          : "";

        const res = await fetch(
          `${API_URL}/user/@${userId}/${type}${queryParams}`
        );
        if (!res.ok) throw new Error("유저 목록을 불러오지 못했습니다.");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userId, type]);

  const handleFollowToggle = async (
    targetUserId: string,
    willFollow: boolean
  ) => {
    try {
      const method = willFollow ? "POST" : "DELETE";

      const token = getAuthToken();
      const res = await fetch(`${API_URL}/user/@${targetUserId}/follow`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("팔로우 상태 변경에 실패했습니다.");

      // 성공하면 해당 유저의 isFollowing 상태를 업데이트
      setUsers(
        users.map((user) =>
          user.userId === targetUserId
            ? { ...user, isFollowing: willFollow }
            : user
        )
      );
    } catch (err) {
      console.error("팔로우 토글 실패:", err);
      alert(
        err instanceof Error ? err.message : "팔로우 상태 변경에 실패했습니다."
      );
      // 에러 처리 (필요하다면 에러 메시지 표시)
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">
        {type === "followers" ? "팔로워" : "팔로잉"} 목록
      </h2>
      {loading && <div className="text-gray-500 py-8">불러오는 중...</div>}
      {error && (
        <div className="text-red-500 py-8">
          {error}
          <button className="ml-2 text-blue-400 underline" onClick={onClose}>
            닫기
          </button>
        </div>
      )}
      {!loading && !error && users.length === 0 && (
        <div className="text-gray-400 py-8">아직 아무도 없습니다.</div>
      )}
      <div className="max-h-96 overflow-y-auto">
        {users.map((user) => (
          <UserListItem
            key={user.userId}
            user={user}
            isFollowing={user.isFollowing}
            onFollowToggle={handleFollowToggle}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </Modal>
  );
};

export default FollowListModal;

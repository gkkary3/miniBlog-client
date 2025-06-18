"use client";

import { Comment } from "@/types/comment";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  userId: string;
  postId: string;
  onCommentUpdate: (comment: Comment) => void;
}

export default function CommentList({
  comments,
  userId,
  postId,
  onCommentUpdate,
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userId={userId}
          postId={postId}
          onCommentUpdate={onCommentUpdate}
        />
      ))}
    </div>
  );
}

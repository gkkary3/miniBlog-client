"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostListSkeleton } from "../components/Skeleton";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/posts");
  }, [router]);

  return (
    <div className="min-h-screen bg-black/80">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <PostListSkeleton count={8} />
      </div>
    </div>
  );
}

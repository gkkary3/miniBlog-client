"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostListSkeleton } from "../components/Skeleton";
import SEO from "../components/SEO";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/posts");
  }, [router]);

  return (
    <>
      <SEO
        title="홈"
        description="Boolog에 오신 것을 환영합니다. 개발자들을 위한 최고의 블로그 플랫폼입니다."
        keywords={["홈", "블로그", "개발자", "기술"]}
      />
      <div className="min-h-screen bg-black/80">
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
          <PostListSkeleton count={8} />
        </div>
      </div>
    </>
  );
}

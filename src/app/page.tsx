"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/posts");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>리다이렉트 중...</p>
    </div>
  );
}

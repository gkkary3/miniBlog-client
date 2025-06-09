"use client"; // 🎯 클라이언트 컴포넌트

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // 🏪 QueryClient 생성 (클라이언트에서만 실행)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분 동안 fresh
            gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
            retry: 1, // 실패 시 1번만 재시도
            refetchOnWindowFocus: false, // 창 포커스 시 재요청 비활성화
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 🛠️ 개발 모드에서만 DevTools 표시 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

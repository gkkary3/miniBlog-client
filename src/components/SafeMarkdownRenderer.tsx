"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";

// 모바일 감지 함수
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// iOS 감지 함수
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const MDEditorMarkdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
      </div>
    ),
  }
);

interface SafeMarkdownRendererProps {
  source: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function SafeMarkdownRenderer({
  source,
  style,
  className = "markdown-body",
}: SafeMarkdownRendererProps) {
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // iOS나 모바일에서 문제가 있을 경우 fallback 사용
    if (isIOS() || isMobile()) {
      // 간단한 테스트를 통해 MDEditor가 작동하는지 확인
      const testElement = document.createElement("div");
      try {
        testElement.innerHTML = '<div data-color-mode="dark">test</div>';
        // 추가 테스트 로직...
      } catch (error) {
        console.warn("MDEditor may not work properly on this device:", error);
        setShouldUseFallback(true);
      }
    }
  }, []);

  // 서버사이드에서는 fallback 렌더링
  if (!isClient) {
    return (
      <div className={className} style={style}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  // 간단한 마크다운 파싱 함수 (fallback용)
  const parseSimpleMarkdown = (text: string) => {
    return (
      text
        // 헤더 처리
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-lg font-semibold mb-2 text-white">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-xl font-semibold mb-3 text-white">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>'
        )
        // 볼드 처리
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-bold text-white">$1</strong>'
        )
        // 이탤릭 처리
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
        // 코드 처리
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-800 px-1 py-0.5 rounded text-green-400 text-sm">$1</code>'
        )
        // 링크 처리
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // 이미지 처리
        .replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" loading="lazy" />'
        )
        // 줄바꿈 처리
        .replace(/\n/g, "<br>")
    );
  };

  // Fallback 렌더러
  const FallbackRenderer = () => (
    <div className={className} style={style}>
      <div
        className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: parseSimpleMarkdown(source),
        }}
      />
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
        <p className="text-yellow-400 text-sm flex items-center">
          <span className="mr-2">ℹ️</span>
          모바일 호환성을 위해 간단한 마크다운 렌더링을 사용중입니다.
        </p>
      </div>
    </div>
  );

  // 강제 fallback이 설정된 경우
  if (shouldUseFallback) {
    return <FallbackRenderer />;
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6 my-4">
          <div className="flex items-center mb-4">
            <span className="text-yellow-400 mr-3 text-xl">⚠️</span>
            <h3 className="text-yellow-400 font-semibold">
              마크다운 렌더링 오류
            </h3>
          </div>
          <p className="text-gray-300 mb-4">
            고급 마크다운 렌더링에 실패했습니다. 기본 렌더링으로 전환합니다.
          </p>
          <FallbackRenderer />
        </div>
      }
    >
      <div className={className}>
        <MDEditorMarkdown
          source={source}
          style={{
            backgroundColor: "transparent",
            color: "inherit",
            padding: 0,
            border: "none",
            minHeight: "200px",
            ...style,
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

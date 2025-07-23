"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";
import {
  shouldUseFallbackRenderer,
  getDeviceInfo,
} from "@/utils/deviceDetection";

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

    // 디바이스 정보 로깅
    const deviceInfo = getDeviceInfo();
    console.log("Device info:", deviceInfo);

    // 디바이스 감지 결과에 따라 fallback 사용 결정
    if (shouldUseFallbackRenderer()) {
      console.log("Using fallback renderer based on device detection");
      setShouldUseFallback(true);
      return;
    }

    // 데스크톱에서도 MDEditor 로딩 테스트
    const timer = setTimeout(() => {
      try {
        // MDEditor 관련 요소가 있는지 확인
        const mdElements = document.querySelectorAll("[data-color-mode]");
        if (mdElements.length === 0) {
          console.warn("MDEditor elements not found, using fallback");
          setShouldUseFallback(true);
        }
      } catch (error) {
        console.warn("MDEditor test failed:", error);
        setShouldUseFallback(true);
      }
    }, 2000); // 2초 후 테스트

    return () => clearTimeout(timer);
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

  // 강화된 마크다운 파싱 함수 (fallback용)
  const parseSimpleMarkdown = (text: string) => {
    let html = text;

    // 코드 블록 처리 (먼저 처리해야 다른 마크다운과 충돌하지 않음)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-green-400 text-sm">${code.trim()}</code></pre>`;
    });

    // 인라인 코드 처리
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-800 px-2 py-1 rounded text-green-400 text-sm">$1</code>'
    );

    // 헤더 처리 (줄 시작에서만)
    html = html.replace(
      /^#### (.*$)/gim,
      '<h4 class="text-base font-semibold mb-2 text-white mt-4">$1</h4>'
    );
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold mb-2 text-white mt-6">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold mb-3 text-white mt-8">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold mb-4 text-white mt-8">$1</h1>'
    );

    // 볼드 처리
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-white">$1</strong>'
    );

    // 이탤릭 처리
    html = html.replace(
      /(?<!\*)\*([^*]+)\*(?!\*)/g,
      '<em class="italic text-gray-300">$1</em>'
    );

    // 취소선 처리
    html = html.replace(
      /~~(.*?)~~/g,
      '<del class="line-through text-gray-500">$1</del>'
    );

    // 링크 처리 (이미지가 아닌 경우만)
    html = html.replace(
      /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // 이미지 처리
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<div class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-lg" loading="lazy" /></div>'
    );

    // 리스트 처리
    html = html.replace(
      /^[\s]*[-*+]\s+(.*)$/gm,
      '<li class="ml-4 mb-1 text-gray-300">• $1</li>'
    );
    html = html.replace(
      /^[\s]*\d+\.\s+(.*)$/gm,
      '<li class="ml-4 mb-1 text-gray-300 list-decimal">$1</li>'
    );

    // 인용 블록 처리
    html = html.replace(
      /^>\s*(.*)$/gm,
      '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 text-gray-300 italic bg-gray-800/30 py-2">$1</blockquote>'
    );

    // 수평선 처리
    html = html.replace(/^---$/gm, '<hr class="border-gray-600 my-6" />');

    // 줄바꿈 처리 (두 번의 줄바꿈은 단락으로, 한 번은 <br>로)
    html = html.replace(
      /\n\s*\n/g,
      '</p><p class="mb-4 text-gray-300 leading-relaxed">'
    );
    html = html.replace(/\n/g, "<br>");

    // 첫 번째와 마지막 단락 태그 추가
    html = '<p class="mb-4 text-gray-300 leading-relaxed">' + html + "</p>";

    return html;
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
      <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <p className="text-blue-400 text-sm flex items-center">
          <span className="mr-2">📱</span>
          모바일 최적화 렌더링을 사용중입니다.
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

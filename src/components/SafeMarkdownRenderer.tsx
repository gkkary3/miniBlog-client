"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";
import { getDeviceInfo } from "@/utils/deviceDetection";

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

    // 모바일이나 iOS에서만 fallback 사용
    if (deviceInfo.isMobile || deviceInfo.isIOS) {
      console.log("Using fallback renderer for mobile/iOS device");
      setShouldUseFallback(true);
      return;
    }

    // 데스크톱에서는 MDEditor 사용 시도
    console.log("Using MDEditor for desktop");
    setShouldUseFallback(false);
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

    // 리스트 처리 (점 중복 방지)
    html = html.replace(
      /^[\s]*[-*+]\s+(.*)$/gm,
      '<div class="flex items-start mb-2 ml-4"><span class="text-gray-400 mr-2 mt-1">•</span><span class="text-gray-300">$1</span></div>'
    );
    html = html.replace(
      /^[\s]*(\d+)\.\s+(.*)$/gm,
      '<div class="flex items-start mb-2 ml-4"><span class="text-gray-400 mr-2 mt-1">$1.</span><span class="text-gray-300">$2</span></div>'
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
    </div>
  );

  // 강제 fallback이 설정된 경우
  if (shouldUseFallback) {
    return <FallbackRenderer />;
  }

  return (
    <ErrorBoundary fallback={<FallbackRenderer />}>
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

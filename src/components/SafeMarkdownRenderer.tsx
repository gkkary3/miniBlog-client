"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";
import { getDeviceInfo } from "@/utils/deviceDetection";
import SimpleMarkdownRenderer from "@/components/SimpleMarkdownRenderer";

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

  // Fallback 렌더러 (SimpleMarkdownRenderer 사용)
  const FallbackRenderer = () => {
    return (
      <SimpleMarkdownRenderer
        source={source}
        style={style}
        className={className}
      />
    );
  };

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

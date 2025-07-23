"use client";

import { useMemo } from "react";

interface SimpleMarkdownRendererProps {
  source: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function SimpleMarkdownRenderer({
  source,
  style,
  className = "markdown-body",
}: SimpleMarkdownRendererProps) {
  const parsedContent = useMemo(() => {
    let html = source;

    try {
      // 안전한 HTML 이스케이프 함수
      const escapeHtml = (text: string) => {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      };

      // 코드 블록 처리 (가장 먼저)
      const codeBlocks: string[] = [];
      html = html.replace(/```[\s\S]*?```/g, (match) => {
        const index = codeBlocks.length;
        codeBlocks.push(match);
        return `__CODE_BLOCK_${index}__`;
      });

      // 인라인 코드 처리
      const inlineCodes: string[] = [];
      html = html.replace(/`[^`]+`/g, (match) => {
        const index = inlineCodes.length;
        inlineCodes.push(match);
        return `__INLINE_CODE_${index}__`;
      });

      // 나머지 HTML 이스케이프
      html = escapeHtml(html);

      // 헤더 처리 (모바일 친화적 크기)
      html = html.replace(
        /^#### (.*)$/gm,
        '<h4 class="text-sm sm:text-base font-semibold mb-2 text-white mt-3 sm:mt-4">$1</h4>'
      );
      html = html.replace(
        /^### (.*)$/gm,
        '<h3 class="text-base sm:text-lg font-semibold mb-2 text-white mt-4 sm:mt-6">$1</h3>'
      );
      html = html.replace(
        /^## (.*)$/gm,
        '<h2 class="text-lg sm:text-xl font-semibold mb-3 text-white mt-6 sm:mt-8">$1</h2>'
      );
      html = html.replace(
        /^# (.*)$/gm,
        '<h1 class="text-xl sm:text-2xl font-bold mb-4 text-white mt-6 sm:mt-8">$1</h1>'
      );

      // 볼드 처리
      html = html.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold text-white">$1</strong>'
      );

      // 이탤릭 처리 (더 안전한 패턴)
      html = html.replace(
        /\*([^*\n]+)\*/g,
        '<em class="italic text-gray-300">$1</em>'
      );

      // 링크 처리 (스타일 개선)
      html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // 이미지 처리 (모바일 최적화)
      html = html.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<div class="my-3 sm:my-4 -mx-3 sm:mx-0"><img src="$2" alt="$1" class="w-full h-auto rounded-lg shadow-lg" loading="lazy" style="max-width: 100%; height: auto;" /></div>'
      );

      // 리스트 처리 (중복 방지)
      html = html.replace(
        /^[\s]*[-*+]\s+(.*)$/gm,
        '<li class="flex items-start mb-2 ml-4"><span class="text-gray-400 mr-2 mt-1">•</span><span class="text-gray-300">$1</span></li>'
      );
      html = html.replace(
        /^[\s]*(\d+)\.\s+(.*)$/gm,
        '<li class="flex items-start mb-2 ml-4"><span class="text-gray-400 mr-2 mt-1">$1.</span><span class="text-gray-300">$2</span></li>'
      );

      // 인용 블록 처리 (스타일 개선)
      html = html.replace(
        /^&gt;\s*(.*)$/gm,
        '<div class="border-l-4 border-gray-500 pl-4 my-4 text-gray-400 italic bg-gray-800/20 py-2 rounded-r-lg">$1</div>'
      );

      // 수평선 처리
      html = html.replace(/^---$/gm, '<hr class="border-gray-600 my-6" />');

      // 코드 블록 복원 (구문 강조 비활성화)
      codeBlocks.forEach((codeBlock, index) => {
        const match = codeBlock.match(/```(\w+)?\n?([\s\S]*?)```/);
        const content = match?.[2]?.trim() || "";

        // HTML 이스케이프만 적용
        const escapedContent = escapeHtml(content);

        html = html.replace(
          `__CODE_BLOCK_${index}__`,
          `<pre class="bg-gray-900 p-2 sm:p-4 rounded-lg my-3 sm:my-4 overflow-x-auto -mx-3 sm:mx-0 border border-gray-700"><code class="text-gray-300 text-xs sm:text-sm font-mono leading-relaxed">${escapedContent}</code></pre>`
        );
      });

      // 인라인 코드 복원 (스타일 개선)
      inlineCodes.forEach((inlineCode, index) => {
        const content = inlineCode.replace(/`([^`]+)`/g, "$1");
        const escapedContent = escapeHtml(content);
        html = html.replace(
          `__INLINE_CODE_${index}__`,
          `<code class="bg-gray-800 px-1 sm:px-2 py-1 rounded text-cyan-300 text-xs sm:text-sm font-mono border border-gray-600">${escapedContent}</code>`
        );
      });

      // 줄바꿈 처리
      html = html.replace(
        /\n\s*\n/g,
        '</p><p class="mb-4 text-gray-300 leading-relaxed">'
      );
      html = html.replace(/\n/g, "<br>");

      // 단락 태그로 감싸기 (모바일 최적화)
      html =
        '<p class="mb-3 sm:mb-4 text-gray-300 leading-relaxed text-sm sm:text-base">' +
        html +
        "</p>";

      // 빈 단락 제거
      html = html.replace(/<p[^>]*><\/p>/g, "");

      return html;
    } catch (error) {
      console.error("Markdown parsing error:", error);
      // 파싱 실패 시 원본 텍스트를 안전하게 표시
      return `<pre class="whitespace-pre-wrap text-gray-300 bg-gray-800/30 p-4 rounded-lg">${source}</pre>`;
    }
  }, [source]);

  return (
    <div className={className} style={style}>
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: parsedContent }}
      />
    </div>
  );
}

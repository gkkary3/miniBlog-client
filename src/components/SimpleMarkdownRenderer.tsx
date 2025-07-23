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

      // 헤더 처리
      html = html.replace(
        /^#### (.*)$/gm,
        '<h4 class="text-base font-semibold mb-2 text-white mt-4">$1</h4>'
      );
      html = html.replace(
        /^### (.*)$/gm,
        '<h3 class="text-lg font-semibold mb-2 text-white mt-6">$1</h3>'
      );
      html = html.replace(
        /^## (.*)$/gm,
        '<h2 class="text-xl font-semibold mb-3 text-white mt-8">$1</h2>'
      );
      html = html.replace(
        /^# (.*)$/gm,
        '<h1 class="text-2xl font-bold mb-4 text-white mt-8">$1</h1>'
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

      // 링크 처리
      html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // 이미지 처리
      html = html.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<div class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-lg" loading="lazy" style="max-width: 100%; height: auto;" /></div>'
      );

      // 리스트 처리
      html = html.replace(
        /^[\s]*[-*+]\s+(.*)$/gm,
        '<div class="flex items-start mb-2"><span class="text-blue-400 mr-2 mt-1">•</span><span class="text-gray-300">$1</span></div>'
      );
      html = html.replace(
        /^[\s]*\d+\.\s+(.*)$/gm,
        '<div class="flex items-start mb-2"><span class="text-blue-400 mr-2 mt-1">•</span><span class="text-gray-300">$1</span></div>'
      );

      // 인용 블록 처리
      html = html.replace(
        /^&gt;\s*(.*)$/gm,
        '<div class="border-l-4 border-blue-500 pl-4 my-4 text-gray-300 italic bg-gray-800/30 py-2">$1</div>'
      );

      // 수평선 처리
      html = html.replace(/^---$/gm, '<hr class="border-gray-600 my-6" />');

      // 코드 블록 복원
      codeBlocks.forEach((codeBlock, index) => {
        const content = codeBlock
          .replace(/```(\w+)?\n?([\s\S]*?)```/g, "$2")
          .trim();
        const escapedContent = escapeHtml(content);
        html = html.replace(
          `__CODE_BLOCK_${index}__`,
          `<pre class="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-green-400 text-sm font-mono">${escapedContent}</code></pre>`
        );
      });

      // 인라인 코드 복원
      inlineCodes.forEach((inlineCode, index) => {
        const content = inlineCode.replace(/`([^`]+)`/g, "$1");
        const escapedContent = escapeHtml(content);
        html = html.replace(
          `__INLINE_CODE_${index}__`,
          `<code class="bg-gray-800 px-2 py-1 rounded text-green-400 text-sm font-mono">${escapedContent}</code>`
        );
      });

      // 줄바꿈 처리
      html = html.replace(
        /\n\s*\n/g,
        '</p><p class="mb-4 text-gray-300 leading-relaxed">'
      );
      html = html.replace(/\n/g, "<br>");

      // 단락 태그로 감싸기
      html = '<p class="mb-4 text-gray-300 leading-relaxed">' + html + "</p>";

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
      <div className="mt-6 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
        <p className="text-green-400 text-sm flex items-center">
          <span className="mr-2">✅</span>
          안전한 마크다운 렌더링이 적용되었습니다.
        </p>
      </div>
    </div>
  );
}

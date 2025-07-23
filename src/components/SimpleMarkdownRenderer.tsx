"use client";

import { useMemo } from "react";

interface SimpleMarkdownRendererProps {
  source: string;
  style?: React.CSSProperties;
  className?: string;
}

// 간단한 코드 구문 강조 함수
function highlightCode(code: string, language: string): string {
  // HTML 이스케이프
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  let highlightedCode = escapeHtml(code);

  // TypeScript/JavaScript 구문 강조 (MDEditor 스타일)
  if (
    language === "ts" ||
    language === "typescript" ||
    language === "js" ||
    language === "javascript"
  ) {
    // 키워드 강조 (보라색)
    highlightedCode = highlightedCode.replace(
      /\b(const|let|var|function|class|interface|type|export|import|from|default|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|extends|implements|public|private|protected|static|readonly|abstract|enum|namespace|module|declare)\b/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    );

    // 연산자 강조 (연한 회색)
    highlightedCode = highlightedCode.replace(
      /(\+\+|--|===|!==|==|!=|<=|>=|<|>|\|\||&&|!|\+|-|\*|\/|%|=|\+=|-=|\*=|\/=|%=|\?|:)/g,
      '<span class="text-gray-300">$1</span>'
    );

    // 문자열 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|`([^`\\]*(\\.[^`\\]*)*)`/g,
      '<span class="text-green-400">$&</span>'
    );

    // 숫자 강조 (주황색)
    highlightedCode = highlightedCode.replace(
      /\b(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\b/g,
      '<span class="text-orange-400">$&</span>'
    );

    // 함수명 강조 (노란색)
    highlightedCode = highlightedCode.replace(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
      '<span class="text-yellow-300">$1</span>'
    );

    // 객체 속성 강조 (청록색)
    highlightedCode = highlightedCode.replace(
      /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      '.<span class="text-cyan-300">$1</span>'
    );

    // 주석 강조 (회색 이탤릭)
    highlightedCode = highlightedCode.replace(
      /\/\/.*$/gm,
      '<span class="text-gray-500 italic">$&</span>'
    );
    highlightedCode = highlightedCode.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="text-gray-500 italic">$&</span>'
    );

    // TypeScript 전용 구문 강조
    if (language === "ts" || language === "typescript") {
      // 타입 강조 (파란색)
      highlightedCode = highlightedCode.replace(
        /:\s*(string|number|boolean|object|any|void|null|undefined|Array|Promise|Date|RegExp|Error|Function|Symbol|BigInt)\b/g,
        ': <span class="text-blue-400 font-medium">$1</span>'
      );

      // 제네릭 타입 강조 (파란색)
      highlightedCode = highlightedCode.replace(
        /&lt;([A-Z][a-zA-Z0-9_]*(?:\[\])?(?:\s*\|\s*[A-Z][a-zA-Z0-9_]*(?:\[\])?)*)&gt;/g,
        '&lt;<span class="text-blue-400">$1</span>&gt;'
      );

      // 인터페이스/타입 이름 강조 (청록색)
      highlightedCode = highlightedCode.replace(
        /\b(interface|type)\s+([A-Z][a-zA-Z0-9_]*)/g,
        '<span class="text-purple-400 font-semibold">$1</span> <span class="text-cyan-400 font-semibold">$2</span>'
      );
    }
  }

  // JSON 구문 강조 (MDEditor 스타일)
  else if (language === "json") {
    // 키 강조 (청록색)
    highlightedCode = highlightedCode.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"(\s*:)/g,
      '<span class="text-cyan-400 font-medium">"$1"</span>$3'
    );

    // 문자열 값 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /:\s*"([^"\\]*(\\.[^"\\]*)*)"/g,
      ': <span class="text-green-400">"$1"</span>'
    );

    // 숫자 강조 (주황색)
    highlightedCode = highlightedCode.replace(
      /:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
      ': <span class="text-orange-400">$1</span>'
    );

    // boolean/null 값 강조 (보라색)
    highlightedCode = highlightedCode.replace(
      /:\s*(true|false|null)\b/g,
      ': <span class="text-purple-400 font-semibold">$1</span>'
    );

    // 구조 문자 강조 (회색)
    highlightedCode = highlightedCode.replace(
      /([{}[\],])/g,
      '<span class="text-gray-300">$1</span>'
    );
  }

  // CSS 구문 강조 (MDEditor 스타일)
  else if (language === "css") {
    // 선택자 강조 (노란색)
    highlightedCode = highlightedCode.replace(
      /^([.#]?[a-zA-Z0-9-_:()[\]]+(?:\s*,\s*[.#]?[a-zA-Z0-9-_:()[\]]+)*)\s*{/gm,
      '<span class="text-yellow-400 font-medium">$1</span> <span class="text-gray-300">{</span>'
    );

    // 속성명 강조 (청록색)
    highlightedCode = highlightedCode.replace(
      /([a-zA-Z-]+)(\s*:)/g,
      '<span class="text-cyan-400 font-medium">$1</span><span class="text-gray-300">$2</span>'
    );

    // 값 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /:\s*([^;}\n]+)/g,
      ': <span class="text-green-400">$1</span>'
    );

    // 단위 강조 (주황색)
    highlightedCode = highlightedCode.replace(
      /(\d+(?:\.\d+)?)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax|deg|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)/g,
      '<span class="text-orange-400">$1</span><span class="text-orange-300">$2</span>'
    );

    // 색상 값 강조 (분홍색)
    highlightedCode = highlightedCode.replace(
      /#([0-9a-fA-F]{3,6})\b/g,
      '<span class="text-pink-400">#$1</span>'
    );

    // 구조 문자 강조 (회색)
    highlightedCode = highlightedCode.replace(
      /([{}();])/g,
      '<span class="text-gray-300">$1</span>'
    );

    // 주석 강조 (회색 이탤릭)
    highlightedCode = highlightedCode.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="text-gray-500 italic">$&</span>'
    );
  }

  // Python 구문 강조
  else if (language === "python" || language === "py") {
    // 키워드 강조 (보라색)
    highlightedCode = highlightedCode.replace(
      /\b(def|class|import|from|as|if|elif|else|for|while|try|except|finally|with|pass|break|continue|return|yield|lambda|and|or|not|in|is|None|True|False|self|super|global|nonlocal|async|await)\b/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    );

    // 문자열 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
      '<span class="text-green-400">$&</span>'
    );

    // 숫자 강조 (주황색)
    highlightedCode = highlightedCode.replace(
      /\b\d+(\.\d+)?\b/g,
      '<span class="text-orange-400">$&</span>'
    );

    // 함수명 강조 (노란색)
    highlightedCode = highlightedCode.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      '<span class="text-yellow-300">$1</span>'
    );

    // 주석 강조 (회색 이탤릭)
    highlightedCode = highlightedCode.replace(
      /#.*$/gm,
      '<span class="text-gray-500 italic">$&</span>'
    );
  }

  // HTML 구문 강조
  else if (language === "html" || language === "xml") {
    // 태그명 강조 (빨간색)
    highlightedCode = highlightedCode.replace(
      /&lt;(\/?[a-zA-Z][a-zA-Z0-9]*)/g,
      '&lt;<span class="text-red-400 font-medium">$1</span>'
    );

    // 속성명 강조 (청록색)
    highlightedCode = highlightedCode.replace(
      /\s([a-zA-Z-]+)=/g,
      ' <span class="text-cyan-400">$1</span>='
    );

    // 속성값 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /="([^"]*)"/g,
      '=<span class="text-green-400">"$1"</span>'
    );

    // 구조 문자 강조 (회색)
    highlightedCode = highlightedCode.replace(
      /(&lt;|&gt;|\/&gt;)/g,
      '<span class="text-gray-300">$1</span>'
    );

    // 주석 강조 (회색 이탤릭)
    highlightedCode = highlightedCode.replace(
      /&lt;!--[\s\S]*?--&gt;/g,
      '<span class="text-gray-500 italic">$&</span>'
    );
  }

  // Java 구문 강조
  else if (language === "java") {
    // 키워드 강조 (보라색)
    highlightedCode = highlightedCode.replace(
      /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|throws|new|this|super|void|int|long|double|float|boolean|char|byte|short|String)\b/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    );

    // 문자열 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g,
      '<span class="text-green-400">$&</span>'
    );

    // 숫자 강조 (주황색)
    highlightedCode = highlightedCode.replace(
      /\b\d+(\.\d+)?[fFdDlL]?\b/g,
      '<span class="text-orange-400">$&</span>'
    );

    // 함수명 강조 (노란색)
    highlightedCode = highlightedCode.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      '<span class="text-yellow-300">$1</span>'
    );

    // 주석 강조 (회색 이탤릭)
    highlightedCode = highlightedCode.replace(
      /\/\/.*$/gm,
      '<span class="text-gray-500 italic">$&</span>'
    );
    highlightedCode = highlightedCode.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="text-gray-500 italic">$&</span>'
    );
  }

  // 기본 언어 처리 (향상된 색상)
  else {
    // 문자열 강조 (초록색)
    highlightedCode = highlightedCode.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g,
      '<span class="text-green-400">$&</span>'
    );

    // 숫자 강조 (주황색)
    highlightedCode = highlightedCode.replace(
      /\b\d+(\.\d+)?\b/g,
      '<span class="text-orange-400">$&</span>'
    );

    // 일반적인 키워드 강조 (보라색)
    highlightedCode = highlightedCode.replace(
      /\b(function|class|if|else|for|while|return|import|export|var|let|const|true|false|null|undefined)\b/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    );

    // 주석 강조 (회색 이탤릭)
    highlightedCode = highlightedCode.replace(
      /\/\/.*$|#.*$/gm,
      '<span class="text-gray-500 italic">$&</span>'
    );
  }

  return highlightedCode;
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

      // 코드 블록 복원 (구문 강조 지원)
      codeBlocks.forEach((codeBlock, index) => {
        const match = codeBlock.match(/```(\w+)?\n?([\s\S]*?)```/);
        const language = match?.[1] || "";
        const content = match?.[2]?.trim() || "";

        // 간단한 구문 강조 적용
        const highlightedContent = highlightCode(content, language);

        html = html.replace(
          `__CODE_BLOCK_${index}__`,
          `<pre class="bg-gray-900 p-2 sm:p-4 rounded-lg my-3 sm:my-4 overflow-x-auto -mx-3 sm:mx-0 border border-gray-700"><code class="text-xs sm:text-sm font-mono leading-relaxed">${highlightedContent}</code></pre>`
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

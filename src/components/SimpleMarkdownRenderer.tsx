"use client";

import { useMemo } from "react";

interface SimpleMarkdownRendererProps {
  source: string;
  style?: React.CSSProperties;
  className?: string;
}

// 구문 강조 우선 적용 함수 (HTML 이스케이프 이전에 처리)
function applyHighlightingFirst(code: string, language: string): string {
  // 언어 별칭 매핑 및 정규화
  const languageAliases: { [key: string]: string } = {
    // JavaScript/TypeScript
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    typescript: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    node: "javascript",
    nodejs: "javascript",

    // Python
    py: "python",
    python: "python",
    python3: "python",
    py3: "python",

    // Shell/Bash
    bash: "bash",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    fish: "bash",
    powershell: "powershell",
    ps1: "powershell",
    cmd: "cmd",
    batch: "cmd",
    bat: "cmd",

    // Web Technologies
    html: "html",
    htm: "html",
    xml: "html",
    css: "css",
    scss: "css",
    sass: "css",
    less: "css",
    stylus: "css",

    // Data formats
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",
    conf: "ini",
    config: "ini",

    // Programming Languages
    java: "java",
    c: "c",
    cpp: "cpp",
    "c++": "cpp",
    cxx: "cpp",
    cc: "cpp",
    cs: "csharp",
    csharp: "csharp",
    "c#": "csharp",
    php: "php",
    ruby: "ruby",
    rb: "ruby",
    go: "go",
    golang: "go",
    rust: "rust",
    rs: "rust",
    swift: "swift",
    kotlin: "kotlin",
    kt: "kotlin",
    scala: "scala",
    r: "r",
    matlab: "matlab",
    m: "matlab",

    // Database
    sql: "sql",
    mysql: "sql",
    postgresql: "sql",
    postgres: "sql",
    sqlite: "sql",
    mssql: "sql",

    // Markup & Config
    markdown: "markdown",
    md: "markdown",
    tex: "latex",
    latex: "latex",

    // Plain text
    text: "text",
    txt: "text",
    plain: "text",
    "": "text", // 언어가 지정되지 않은 경우
  };

  const normalizedLanguage =
    languageAliases[language.toLowerCase()] || language.toLowerCase();

  // 지원하는 언어들 (구문 강조 적용)
  const supportedLanguages = [
    "javascript",
    "typescript",
    "python",
    "bash",
    "powershell",
    "cmd",
    "html",
    "css",
    "json",
    "sql",
    "java",
    "c",
    "cpp",
    "csharp",
    "php",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "scala",
  ];

  // HTML 특수 문자 먼저 이스케이프
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  if (!supportedLanguages.includes(normalizedLanguage)) {
    // 지원하지 않는 언어는 기본 이스케이프만
    return escapeHtml(code);
  }

  try {
    let result = code;

    // 1. 언어별 키워드 강조 (이스케이프 이전에 처리)
    const getKeywords = () => {
      const commonKeywords = [
        // JavaScript/TypeScript
        "const",
        "let",
        "var",
        "function",
        "class",
        "export",
        "default",
        "async",
        "await",
        "return",
        "if",
        "else",
        "for",
        "while",
        "do",
        "import",
        "from",
        "interface",
        "type",
        "enum",
        "namespace",
        "public",
        "private",
        "protected",
        "static",
        "readonly",
        "abstract",
        "extends",
        "implements",
        "super",
        "this",
        "new",
        "delete",
        "typeof",
        "instanceof",
        "in",
        "of",
        "try",
        "catch",
        "finally",
        "throw",
        "switch",
        "case",
        "break",
        "continue",
        "with",
        "debugger",
        "true",
        "false",
        "null",
        "undefined",
        "void",
        "never",
        "any",
        "string",
        "number",
        "boolean",
        "object",
        "symbol",
        "bigint",

        // Python
        "def",
        "class",
        "import",
        "from",
        "as",
        "if",
        "elif",
        "else",
        "for",
        "while",
        "in",
        "not",
        "and",
        "or",
        "is",
        "lambda",
        "try",
        "except",
        "finally",
        "raise",
        "with",
        "yield",
        "pass",
        "break",
        "continue",
        "global",
        "nonlocal",
        "assert",
        "del",
        "True",
        "False",
        "None",
        "self",
        "cls",

        // Java/C#
        "public",
        "private",
        "protected",
        "static",
        "final",
        "abstract",
        "class",
        "interface",
        "extends",
        "implements",
        "package",
        "import",
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "default",
        "try",
        "catch",
        "finally",
        "throw",
        "throws",
        "new",
        "this",
        "super",
        "return",
        "break",
        "continue",
        "synchronized",
        "volatile",
        "transient",
        "native",
        "strictfp",
        "void",
        "int",
        "double",
        "float",
        "long",
        "short",
        "byte",
        "char",
        "boolean",
        "String",
        "true",
        "false",
        "null",

        // C/C++
        "int",
        "char",
        "float",
        "double",
        "void",
        "long",
        "short",
        "signed",
        "unsigned",
        "struct",
        "union",
        "enum",
        "typedef",
        "sizeof",
        "const",
        "volatile",
        "extern",
        "static",
        "auto",
        "register",
        "inline",
        "restrict",
        "bool",
        "true",
        "false",
        "NULL",

        // Go
        "package",
        "import",
        "func",
        "var",
        "const",
        "type",
        "struct",
        "interface",
        "map",
        "chan",
        "go",
        "defer",
        "select",
        "range",
        "fallthrough",
        "goto",
        "if",
        "else",
        "for",
        "switch",
        "case",
        "default",
        "break",
        "continue",
        "return",
        "true",
        "false",
        "nil",

        // Rust
        "fn",
        "let",
        "mut",
        "const",
        "static",
        "struct",
        "enum",
        "impl",
        "trait",
        "for",
        "in",
        "where",
        "if",
        "else",
        "match",
        "loop",
        "while",
        "break",
        "continue",
        "return",
        "pub",
        "mod",
        "use",
        "crate",
        "super",
        "self",
        "Self",
        "true",
        "false",
        "Some",
        "None",

        // Shell/Bash
        "if",
        "then",
        "else",
        "elif",
        "fi",
        "case",
        "esac",
        "for",
        "while",
        "until",
        "do",
        "done",
        "function",
        "return",
        "break",
        "continue",
        "exit",
        "export",
        "local",
        "readonly",
        "declare",
        "unset",
        "shift",
        "eval",
        "exec",
        "source",
        "alias",
        "unalias",
        "echo",
        "printf",
        "read",
        "test",
        "true",
        "false",

        // SQL
        "SELECT",
        "FROM",
        "WHERE",
        "JOIN",
        "INNER",
        "LEFT",
        "RIGHT",
        "FULL",
        "ON",
        "GROUP",
        "BY",
        "HAVING",
        "ORDER",
        "ASC",
        "DESC",
        "INSERT",
        "INTO",
        "VALUES",
        "UPDATE",
        "SET",
        "DELETE",
        "CREATE",
        "TABLE",
        "ALTER",
        "DROP",
        "INDEX",
        "VIEW",
        "PROCEDURE",
        "FUNCTION",
        "TRIGGER",
        "DATABASE",
        "SCHEMA",
        "CONSTRAINT",
        "PRIMARY",
        "FOREIGN",
        "KEY",
        "UNIQUE",
        "NOT",
        "NULL",
        "DEFAULT",
        "AUTO_INCREMENT",
        "REFERENCES",

        // CSS
        "color",
        "background",
        "margin",
        "padding",
        "border",
        "width",
        "height",
        "display",
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "float",
        "clear",
        "overflow",
        "visibility",
        "z-index",
        "opacity",
        "cursor",
        "font",
        "text",
        "line",
        "letter",
        "word",
        "white",
        "vertical",
        "important",
        "inherit",
        "initial",
        "unset",
        "auto",
        "none",
        "block",
        "inline",
        "flex",
        "grid",
        "absolute",
        "relative",
        "fixed",
        "sticky",

        // HTML
        "DOCTYPE",
        "html",
        "head",
        "body",
        "title",
        "meta",
        "link",
        "script",
        "style",
        "div",
        "span",
        "p",
        "a",
        "img",
        "ul",
        "ol",
        "li",
        "table",
        "tr",
        "td",
        "th",
        "form",
        "input",
        "button",
        "select",
        "option",
        "textarea",
        "label",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "br",
        "hr",
        "strong",
        "em",
        "code",
        "pre",
        "blockquote",
        "section",
        "article",
        "header",
        "footer",
        "nav",
        "aside",
        "main",
        "figure",
        "figcaption",
      ];

      return [...new Set(commonKeywords)]; // 중복 제거
    };

    const keywords = getKeywords();

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      result = result.replace(
        regex,
        `__KEYWORD_START__${keyword}__KEYWORD_END__`
      );
    });

    // 2. HTML 태그 강조 (JSX/TSX 지원)
    result = result.replace(
      /<(\/?[a-zA-Z][a-zA-Z0-9]*)/g,
      "__TAG_START__<$1__TAG_END__"
    );
    result = result.replace(/>/g, "__TAG_BRACKET_START__>__TAG_BRACKET_END__");

    // 3. 문자열 강조 (이스케이프 이전에 처리)
    result = result.replace(/"([^"]*)"/g, '__STRING_START__"$1"__STRING_END__');
    result = result.replace(/'([^']*)'/g, "__STRING_START__'$1'__STRING_END__");
    result = result.replace(/`([^`]*)`/g, "__STRING_START__`$1`__STRING_END__");

    // 4. 숫자 강조
    result = result.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      "__NUMBER_START__$1__NUMBER_END__"
    );

    // 5. 연산자 강조 (훨씬 더 많은 연산자 지원)
    const operators = [
      // 할당 연산자
      "=",
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      "**=",
      "&=",
      "|=",
      "^=",
      "<<=",
      ">>=",
      ">>>=",
      // 비교 연산자
      "===",
      "!==",
      "==",
      "!=",
      "<=",
      ">=",
      "<",
      ">",
      // 산술 연산자
      "+",
      "-",
      "*",
      "/",
      "%",
      "**",
      // 논리 연산자
      "&&",
      "||",
      "!",
      // 비트 연산자
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      ">>>",
      // 삼항 연산자
      "?",
      ":",
      // 증감 연산자
      "++",
      "--",
      // 기타
      "=>",
      "->",
      "::",
      "...",
      "..",
      "?.",
      "??",
      "??=",
      "||=",
      "&&=",
    ];

    // 긴 연산자부터 처리 (겹치는 경우 방지)
    const sortedOperators = operators.sort((a, b) => b.length - a.length);

    sortedOperators.forEach((op) => {
      const escapedOp = op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(\\s|^)(${escapedOp})(\\s|$)`, "g");
      result = result.replace(
        regex,
        "$1__OPERATOR_START__$2__OPERATOR_END__$3"
      );
    });

    // 6. 중괄호, 대괄호, 소괄호 강조
    result = result.replace(
      /([{}[\]()])/g,
      "__BRACKET_START__$1__BRACKET_END__"
    );

    // 7. 언어별 특수 처리
    // Shell/Bash 명령어 강조
    if (
      normalizedLanguage === "bash" ||
      normalizedLanguage === "sh" ||
      normalizedLanguage === "shell" ||
      normalizedLanguage === "powershell" ||
      normalizedLanguage === "cmd"
    ) {
      // 명령어 앞의 $ 또는 # 프롬프트
      result = result.replace(
        /^(\$|#)\s*/gm,
        "__PROMPT_START__$1__PROMPT_END__ "
      );
      // 옵션 플래그 (-옵션, --옵션)
      result = result.replace(
        /(\s)(-{1,2}[a-zA-Z0-9-]+)/g,
        "$1__FLAG_START__$2__FLAG_END__"
      );
      // 파이프 연산자
      result = result.replace(
        /(\s)(\|)(\s)/g,
        "$1__PIPE_START__$2__PIPE_END__$3"
      );
      // 리다이렉션
      result = result.replace(
        /(\s)(>|>>|<|<<)(\s)/g,
        "$1__REDIRECT_START__$2__REDIRECT_END__$3"
      );
    }

    // Python 특수 처리
    if (normalizedLanguage === "python" || normalizedLanguage === "py") {
      // 데코레이터
      result = result.replace(
        /^(\s*)(@\w+)/gm,
        "$1__DECORATOR_START__$2__DECORATOR_END__"
      );
      // f-string
      result = result.replace(/(f["'])/g, "__FSTRING_START__$1__FSTRING_END__");
    }

    // SQL 특수 처리
    if (normalizedLanguage === "sql") {
      // 대소문자 구분 없이 키워드 처리를 위해 대문자로 변환
      const sqlKeywords = [
        "SELECT",
        "FROM",
        "WHERE",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "ALTER",
        "DROP",
      ];
      sqlKeywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "gi");
        result = result.replace(
          regex,
          `__KEYWORD_START__${keyword}__KEYWORD_END__`
        );
      });
    }

    // 8. 주석 강조 (언어별)
    if (normalizedLanguage === "python" || normalizedLanguage === "py") {
      // Python 주석 (#)
      result = result.replace(/#.*$/gm, "__COMMENT_START__$&__COMMENT_END__");
      // Python 독스트링
      result = result.replace(
        /"""[\s\S]*?"""/g,
        "__DOCSTRING_START__$&__DOCSTRING_END__"
      );
      result = result.replace(
        /'''[\s\S]*?'''/g,
        "__DOCSTRING_START__$&__DOCSTRING_END__"
      );
    } else if (
      normalizedLanguage === "bash" ||
      normalizedLanguage === "sh" ||
      normalizedLanguage === "shell"
    ) {
      // Shell 주석 (#)
      result = result.replace(/#.*$/gm, "__COMMENT_START__$&__COMMENT_END__");
    } else if (normalizedLanguage === "sql") {
      // SQL 주석 (-- 또는 #)
      result = result.replace(/--.*$/gm, "__COMMENT_START__$&__COMMENT_END__");
      result = result.replace(/#.*$/gm, "__COMMENT_START__$&__COMMENT_END__");
      result = result.replace(
        /\/\*[\s\S]*?\*\//g,
        "__COMMENT_START__$&__COMMENT_END__"
      );
    } else if (normalizedLanguage === "css") {
      // CSS 주석
      result = result.replace(
        /\/\*[\s\S]*?\*\//g,
        "__COMMENT_START__$&__COMMENT_END__"
      );
    } else {
      // JavaScript/TypeScript/Java/C/C++ 등의 주석
      result = result.replace(
        /\/\/.*$/gm,
        "__COMMENT_START__$&__COMMENT_END__"
      );
      result = result.replace(
        /\/\*[\s\S]*?\*\//g,
        "__COMMENT_START__$&__COMMENT_END__"
      );
    }

    // 6. HTML 이스케이프 적용
    result = escapeHtml(result);

    // 8. 플레이스홀더를 실제 HTML 태그로 변환
    result = result.replace(
      /__KEYWORD_START__(.*?)__KEYWORD_END__/g,
      '<span class="text-purple-400 font-semibold">$1</span>'
    );
    result = result.replace(
      /__TAG_START__(.*?)__TAG_END__/g,
      '<span class="text-red-400 font-medium">$1</span>'
    );
    result = result.replace(
      /__TAG_BRACKET_START__(.*?)__TAG_BRACKET_END__/g,
      '<span class="text-red-400">$1</span>'
    );
    result = result.replace(
      /__STRING_START__(.*?)__STRING_END__/g,
      '<span class="text-green-400">$1</span>'
    );
    result = result.replace(
      /__NUMBER_START__(.*?)__NUMBER_END__/g,
      '<span class="text-orange-400">$1</span>'
    );
    result = result.replace(
      /__OPERATOR_START__(.*?)__OPERATOR_END__/g,
      '<span class="text-cyan-400">$1</span>'
    );
    result = result.replace(
      /__BRACKET_START__(.*?)__BRACKET_END__/g,
      '<span class="text-yellow-400">$1</span>'
    );
    // 언어별 특수 요소 변환
    result = result.replace(
      /__PROMPT_START__(.*?)__PROMPT_END__/g,
      '<span class="text-green-400 font-bold">$1</span>'
    );
    result = result.replace(
      /__FLAG_START__(.*?)__FLAG_END__/g,
      '<span class="text-blue-400">$1</span>'
    );
    result = result.replace(
      /__PIPE_START__(.*?)__PIPE_END__/g,
      '<span class="text-purple-400 font-bold">$1</span>'
    );
    result = result.replace(
      /__REDIRECT_START__(.*?)__REDIRECT_END__/g,
      '<span class="text-red-400 font-bold">$1</span>'
    );
    result = result.replace(
      /__DECORATOR_START__(.*?)__DECORATOR_END__/g,
      '<span class="text-yellow-400 font-semibold">$1</span>'
    );
    result = result.replace(
      /__FSTRING_START__(.*?)__FSTRING_END__/g,
      '<span class="text-green-400 font-semibold">$1</span>'
    );
    result = result.replace(
      /__DOCSTRING_START__(.*?)__DOCSTRING_END__/g,
      '<span class="text-green-300 italic">$1</span>'
    );
    result = result.replace(
      /__COMMENT_START__(.*?)__COMMENT_END__/g,
      '<span class="text-gray-500 italic">$1</span>'
    );

    return result;
  } catch (error) {
    console.error("Highlighting error:", error);
    return escapeHtml(code);
  }
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

      // 4칸 들여쓰기 코드 블록 처리 (마크다운 표준)
      const indentedCodeBlocks: string[] = [];
      html = html.replace(/^(    |\t)(.*)$/gm, (match, indent, content) => {
        const index = indentedCodeBlocks.length;
        indentedCodeBlocks.push(content);
        console.log(`Found 4-space indented code block: "${content}"`);
        return `__INDENTED_CODE_${index}__`;
      });

      // 일반 들여쓰기 처리 (1-3칸)
      const indentedLines: {
        original: string;
        indent: string;
        content: string;
      }[] = [];
      html = html.replace(/^([ ]{1,3})(.*)$/gm, (match, indent, content) => {
        const index = indentedLines.length;
        indentedLines.push({ original: match, indent, content });
        console.log(`Found ${indent.length}-space indented line: "${content}"`);
        return `__INDENTED_LINE_${index}__`;
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

      // 이미지 처리 (모바일 최적화 개선)
      const imageMatches = html.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
      if (imageMatches) {
        console.log("Found images in markdown:", imageMatches);
      }

      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        console.log("Processing image:", { alt, src, match });
        return `<div class="my-4 w-full overflow-visible"><img src="${src}" alt="${alt}" class="w-full h-auto rounded-lg shadow-lg block" loading="lazy" style="max-width: 100%; height: auto; display: block !important; visibility: visible !important; opacity: 1 !important;" onload="console.log('✅ Image loaded successfully:', this.src, this.naturalWidth + 'x' + this.naturalHeight)" onerror="console.error('❌ Image failed to load:', this.src, this)" /></div>`;
      });

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

      // 코드 블록 복원 (구문 강조 우선 적용)
      codeBlocks.forEach((codeBlock, index) => {
        // 공백이 있는 경우도 처리: ``` js 또는 ```js
        const match = codeBlock.match(/```\s*(\w+)?\s*\n?([\s\S]*?)```/);
        const language = match?.[1]?.trim() || "";
        const content = match?.[2]?.trim() || "";

        // 구문 강조를 먼저 적용한 후 HTML 이스케이프
        const highlightedContent = applyHighlightingFirst(content, language);

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

      // 4칸 들여쓰기 코드 블록 복원
      indentedCodeBlocks.forEach((codeContent, index) => {
        const highlightedContent = applyHighlightingFirst(codeContent, "");
        html = html.replace(
          `__INDENTED_CODE_${index}__`,
          `<pre class="bg-gray-900 p-2 sm:p-4 rounded-lg my-3 sm:my-4 overflow-x-auto border border-gray-700"><code class="text-xs sm:text-sm font-mono leading-relaxed text-gray-300">${highlightedContent}</code></pre>`
        );
      });

      // 일반 들여쓰기된 라인 복원
      indentedLines.forEach((line, index) => {
        const spaces = line.indent.length;
        const indentStyle = `padding-left: ${spaces * 1.2}em; margin-left: 0;`;

        html = html.replace(
          `__INDENTED_LINE_${index}__`,
          `<div class="whitespace-pre-wrap text-gray-300 leading-relaxed" style="${indentStyle}">${line.content}</div>`
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

      // 최종 HTML에서 이미지 확인
      const finalImages = html.match(/<img[^>]*>/g);
      if (finalImages) {
        console.log("Final HTML contains images:", finalImages.length);
        console.log("Image tags:", finalImages);
      } else {
        console.log("No images found in final HTML");
      }

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

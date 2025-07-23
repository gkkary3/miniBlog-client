"use client";

import { useState } from "react";

interface MobileMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  placeholder?: string;
}

export default function MobileMarkdownEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "마크다운 문법을 사용하여 내용을 작성하세요...",
}: MobileMarkdownEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      const imageMarkdown = `![${file.name}](${imageUrl})\n\n`;

      // 커서 위치에 이미지 마크다운 삽입
      const textarea = document.getElementById(
        "mobile-editor"
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + imageMarkdown + value.substring(end);
        onChange(newValue);

        // 커서를 이미지 마크다운 뒤로 이동
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + imageMarkdown.length,
            start + imageMarkdown.length
          );
        }, 0);
      } else {
        onChange(value + imageMarkdown);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      e.target.value = "";
    }
  };

  // 마크다운 단축키 삽입 함수
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById(
      "mobile-editor"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    const newValue = value.substring(0, start) + newText + value.substring(end);

    onChange(newValue);

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      } else {
        textarea.setSelectionRange(
          start + before.length,
          start + before.length
        );
      }
    }, 0);
  };

  return (
    <div className="w-full">
      {/* 도구 모음 */}
      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-black/20 rounded-t-xl border border-gray-600 border-b-0">
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors italic"
          title="기울임"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("`", "`")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors font-mono"
          title="인라인 코드"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("\n```\n", "\n```\n")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          title="코드 블록"
        >
          📄
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("## ")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          title="헤더"
        >
          H
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("[", "]()")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          title="링크"
        >
          🔗
        </button>

        {/* 이미지 업로드 버튼 */}
        <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors cursor-pointer flex items-center gap-1">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              <span>업로드중</span>
            </>
          ) : (
            <>
              <span>📷</span>
              <span>이미지</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* 텍스트 에디터 */}
      <textarea
        id="mobile-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[400px] sm:h-[500px] p-4 bg-black/20 border border-gray-600 rounded-b-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      />

      {/* 마크다운 도움말 */}
      <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
        <p className="text-gray-400 text-xs mb-2">💡 마크다운 문법 도움말:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            **굵게** → <strong className="text-white">굵게</strong>
          </div>
          <div>
            *기울임* → <em className="text-white">기울임</em>
          </div>
          <div>
            `코드` →{" "}
            <code className="bg-gray-700 px-1 rounded text-green-400">
              코드
            </code>
          </div>
          <div>
            ## 제목 → <span className="text-white font-semibold">제목</span>
          </div>
        </div>
      </div>

      {/* 글자 수 표시 */}
      <div className="mt-2 text-right">
        <span className="text-gray-400 text-sm">
          {value.length.toLocaleString()} 글자
        </span>
      </div>
    </div>
  );
}

"use client";

import { CategoryStats } from "@/types/post";

interface CategorySidebarProps {
  categories: CategoryStats[];
  selectedCategory: string | null;
  onCategorySelect: (categoryName: string | null) => void;
  totalPosts: number;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onCategorySelect,
  totalPosts,
}: CategorySidebarProps) {
  return (
    <div className="bg-black/40 rounded-lg p-6 sticky top-8">
      <h3 className="text-xl font-bold mb-4 text-white">카테고리</h3>

      <div className="space-y-2">
        {/* 전체 카테고리 버튼 */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full flex justify-between items-center p-3 rounded-lg transition-all text-left ${
            selectedCategory === null
              ? "text-white bg-gray-700/70"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
          }`}
        >
          <span>📚 전체</span>
          <span className="text-sm">({totalPosts})</span>
        </button>

        {/* 개별 카테고리들 */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            className={`w-full flex justify-between items-center p-3 rounded-lg transition-all text-left ${
              selectedCategory === category.name
                ? "text-white bg-gray-700/70"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <span>#{category.name}</span>
            <span className="text-sm">({category.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

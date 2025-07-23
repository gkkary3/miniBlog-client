"use client";

import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = "/og-image.png",
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | Boolog`
    : "Boolog - 개발자들을 위한 블로그 플랫폼";
  const fullDescription =
    description ||
    "개발자들을 위한 블로그 플랫폼입니다. 기술 블로그, 개발 노트, 프로젝트 공유를 위한 공간입니다.";
  const fullUrl = url ? `https://boolog.com${url}` : "https://boolog.com";

  useEffect(() => {
    // 동적으로 메타 태그 업데이트
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(
        `meta[name="${name}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 기본 메타 태그들
    updateMetaTag("description", fullDescription);
    updateMetaTag("keywords", keywords.join(", "));
    if (author) updateMetaTag("author", author);

    // Open Graph 태그들
    updatePropertyTag("og:title", fullTitle);
    updatePropertyTag("og:description", fullDescription);
    updatePropertyTag("og:type", type);
    updatePropertyTag("og:url", fullUrl);
    updatePropertyTag("og:image", image);
    updatePropertyTag("og:site_name", "Boolog");
    updatePropertyTag("og:locale", "ko_KR");

    // Twitter Card 태그들
    updatePropertyTag("twitter:card", "summary_large_image");
    updatePropertyTag("twitter:title", fullTitle);
    updatePropertyTag("twitter:description", fullDescription);
    updatePropertyTag("twitter:image", image);
    updatePropertyTag("twitter:creator", "@boolog");

    // 추가 메타 태그들
    if (publishedTime)
      updatePropertyTag("article:published_time", publishedTime);
    if (modifiedTime) updatePropertyTag("article:modified_time", modifiedTime);

    // 제목 업데이트
    document.title = fullTitle;
  }, [
    fullTitle,
    fullDescription,
    keywords,
    image,
    fullUrl,
    type,
    author,
    publishedTime,
    modifiedTime,
  ]);

  return null;
}

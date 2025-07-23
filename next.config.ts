/** @type {import('next').NextConfig} */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });
    return config;
  },
  images: {
    domains: [
      "velog.velcdn.com",
      "img1.kakaocdn.net",
      // 이미 등록된 다른 도메인도 여기에 추가
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "miniblog-uploads-1.s3.ap-southeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mud-kage.kakao.com",
        port: "",
        pathname: "/**",
      },
      // 개발 환경에서 localhost 허용
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;

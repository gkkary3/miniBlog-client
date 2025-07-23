import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import QueryProvider from "./QueryProvider";
import AuthInitializer from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Boolog - 개발자들을 위한 블로그 플랫폼",
    template: "%s | Boolog",
  },
  description:
    "개발자들을 위한 블로그 플랫폼입니다. 기술 블로그, 개발 노트, 프로젝트 공유를 위한 공간입니다.",
  keywords: [
    "블로그",
    "개발자",
    "기술",
    "프로그래밍",
    "코딩",
    "프로젝트",
    "개발 노트",
  ],
  authors: [{ name: "Boolog Team" }],
  creator: "Boolog Team",
  publisher: "Boolog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://boolog.com"), // 실제 도메인으로 변경 필요
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://boolog.com",
    title: "Boolog - 개발자들을 위한 블로그 플랫폼",
    description:
      "개발자들을 위한 블로그 플랫폼입니다. 기술 블로그, 개발 노트, 프로젝트 공유를 위한 공간입니다.",
    siteName: "Boolog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Boolog - 개발자들을 위한 블로그 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Boolog - 개발자들을 위한 블로그 플랫폼",
    description:
      "개발자들을 위한 블로그 플랫폼입니다. 기술 블로그, 개발 노트, 프로젝트 공유를 위한 공간입니다.",
    images: ["/og-image.png"],
    creator: "@boolog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Google Search Console에서 받은 코드로 변경
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthInitializer />
          <Header />
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import Header from "@/components/Header";
import QueryProvider from "./QueryProvider";
import AuthInitializer from "@/components/AuthInitializer";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Boolog",
  description: "나만의 블로그를 만들어보세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className="min-h-screen bg-black text-white">
        <QueryProvider>
          <AuthInitializer />
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}

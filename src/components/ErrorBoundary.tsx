"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 my-4">
            <div className="flex items-center mb-4">
              <span className="text-red-400 mr-3 text-xl">⚠️</span>
              <h3 className="text-red-400 font-semibold">
                콘텐츠를 불러오는 중 오류가 발생했습니다
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              마크다운 콘텐츠를 렌더링하는 중 문제가 발생했습니다. 페이지를
              새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                새로고침
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4">
                <summary className="text-gray-400 cursor-pointer">
                  개발자 정보
                </summary>
                <pre className="text-xs text-gray-500 mt-2 bg-black/20 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

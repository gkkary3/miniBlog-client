"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerificationVerified, setIsVerificationVerified] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationVerifying, setVerificationVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { register, loading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/posts");
    }
  }, [isAuthenticated, router]);

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 이메일 인증번호 발송 API
  const sendVerification = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/send-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("인증번호 발송에 실패했습니다.");
    }

    return response.json();
  };

  // 이메일 인증번호 확인 API
  const verifyEmail = async (email: string, verificationCode: string) => {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, verificationCode }),
    });

    if (!response.ok) {
      throw new Error("인증번호 확인에 실패했습니다.");
    }

    return response.json();
  };

  // 인증번호 발송 핸들러
  const handleSendVerification = async () => {
    if (!email) {
      setVerificationError("이메일을 먼저 입력해주세요.");
      return;
    }

    setVerificationSending(true);
    setVerificationError("");
    setVerificationSuccess("");

    try {
      const result = await sendVerification(email);
      if (result.success) {
        setIsVerificationSent(true);
        setVerificationSuccess(
          result.message || "인증번호가 이메일로 발송되었습니다."
        );
        setCountdown(300); // 5분 카운트다운
      } else {
        setVerificationError(result.message || "인증번호 발송에 실패했습니다.");
      }
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "인증번호 발송 중 오류가 발생했습니다."
      );
    } finally {
      setVerificationSending(false);
    }
  };

  // 인증번호 확인 핸들러
  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setVerificationError("인증번호를 입력해주세요.");
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationError("인증번호는 6자리여야 합니다.");
      return;
    }

    setVerificationVerifying(true);
    setVerificationError("");
    setVerificationSuccess("");

    try {
      const result = await verifyEmail(email, verificationCode);
      if (result.success && result.data?.verified) {
        setIsVerificationVerified(true);
        setVerificationSuccess(""); // 기존 발송 메시지 초기화
        setCountdown(0); // 카운트다운 정지
      } else {
        setVerificationError(result.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "인증번호 확인 중 오류가 발생했습니다."
      );
    } finally {
      setVerificationVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isVerificationVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }

    if (!validatePassword(password).isValid) {
      setError("비밀번호는 8자 이상 영문, 숫자, 특수문자가 포함되어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (userId.length < 3) {
      setError("사용자 ID는 3글자 이상이어야 합니다.");
      return;
    }

    try {
      await register({ email, password, username, userId });
      router.push("/posts");
    } catch {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 카운트다운 시간 포맷팅
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // 🔐 비밀번호 유효성 검사 함수
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    return {
      isValid: minLength && hasLetter && hasNumber && hasSpecialChar,
      minLength,
      hasLetter,
      hasNumber,
      hasSpecialChar,
    };
  };

  return (
    <div className="min-h-screen bg-black/80 text-white flex items-center justify-center relative overflow-hidden py-12">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 메인 회원가입 카드 */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent mb-2">
              회원가입
            </h1>
            <p className="text-gray-400">새로운 블로그 여정을 시작해보세요</p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 사용자명 입력 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                닉네임 (표시될 이름)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">👤</span>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="홍길동"
                />
              </div>
            </div>

            {/* 사용자 ID 입력 */}
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                ID (고유값)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">🆔</span>
                </div>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  pattern="[a-zA-Z0-9]+"
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="hong123"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                영문, 숫자로만 구성된 고유한 ID를 입력하세요
              </p>
            </div>

            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                이메일 주소
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">📧</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // 이메일이 변경되면 인증 상태 초기화
                      setIsVerificationSent(false);
                      setIsVerificationVerified(false);
                      setVerificationCode("");
                      setVerificationError("");
                      setVerificationSuccess("");
                      setCountdown(0);
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="example@email.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={
                    verificationSending || !email || isVerificationVerified
                  }
                  className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {verificationSending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-1"></div>
                      발송중...
                    </div>
                  ) : isVerificationSent ? (
                    "재발송"
                  ) : (
                    "인증번호 발송"
                  )}
                </button>
              </div>

              {/* 성공 메시지 */}
              {verificationSuccess && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-700/50 rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="text-green-400 text-sm flex items-center">
                      {verificationSuccess}
                    </p>
                    {countdown > 0 && (
                      <p className="text-green-400 text-sm">
                        {formatCountdown(countdown)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 인증번호 입력 필드 */}
              {isVerificationSent && !isVerificationVerified && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">🔢</span>
                      </div>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 6) {
                            setVerificationCode(value);
                          }
                        }}
                        placeholder="6자리 인증번호를 입력하세요"
                        className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={
                        verificationVerifying ||
                        !verificationCode ||
                        countdown <= 0
                      }
                      className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {verificationVerifying ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-1"></div>
                          확인중...
                        </div>
                      ) : (
                        "인증번호 확인"
                      )}
                    </button>
                  </div>
                  {countdown <= 0 && (
                    <p className="text-red-400 text-sm">
                      인증번호가 만료되었습니다. 다시 발송해주세요.
                    </p>
                  )}
                </div>
              )}

              {/* 인증 완료 메시지 */}
              {isVerificationVerified && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-700/50 rounded-md">
                  <p className="text-green-400 text-sm flex items-center">
                    이메일 인증이 완료되었습니다
                  </p>
                </div>
              )}

              {/* 인증 에러 메시지 */}
              {verificationError && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded-md">
                  <p className="text-red-400 text-sm flex items-center">
                    {verificationError}
                  </p>
                </div>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">🔒</span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="8자 이상 영문, 숫자, 특수문자 포함"
                />
              </div>

              {/* 비밀번호 조건 안내 */}
              {password && (
                <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                  <p className="text-xs text-gray-300 mb-2">비밀번호 조건:</p>
                  <div className="space-y-1">
                    <div
                      className={`text-xs flex items-center ${
                        validatePassword(password).minLength
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <span className="mr-1">
                        {validatePassword(password).minLength ? "●" : "○"}
                      </span>
                      8자 이상
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        validatePassword(password).hasLetter
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <span className="mr-1">
                        {validatePassword(password).hasLetter ? "●" : "○"}
                      </span>
                      영문 포함
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        validatePassword(password).hasNumber
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <span className="mr-1">
                        {validatePassword(password).hasNumber ? "●" : "○"}
                      </span>
                      숫자 포함
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        validatePassword(password).hasSpecialChar
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <span className="mr-1">
                        {validatePassword(password).hasSpecialChar ? "●" : "○"}
                      </span>
                      특수문자 포함
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">🔐</span>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 bg-black/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-green-500"
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
              {/* 실시간 비밀번호 일치 여부 표시 */}
              {confirmPassword && (
                <div
                  className={`mt-2 p-2 rounded-md ${
                    password === confirmPassword
                      ? "bg-green-900/20"
                      : "bg-red-900/20"
                  }`}
                >
                  <p
                    className={`text-xs flex items-center ${
                      password === confirmPassword
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    <span className="mr-1">
                      {password === confirmPassword ? "●" : "○"}
                    </span>
                    {password === confirmPassword
                      ? "비밀번호가 일치합니다"
                      : "비밀번호가 일치하지 않습니다"}
                  </p>
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                <div className="flex items-center">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={
                loading ||
                !validatePassword(password).isValid ||
                password !== confirmPassword ||
                !confirmPassword ||
                !isVerificationVerified
              }
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  가입 처리 중...
                </div>
              ) : (
                "회원가입"
              )}
            </button>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/40 text-gray-400">또는</span>
              </div>
            </div>

            {/* 로그인 링크 */}
            <div className="text-center">
              <p className="text-gray-400">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
                >
                  로그인
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* 하단 추가 정보 */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            가입하여 나만의 블로그를 만들어보세요
          </p>
        </div>
      </div>
    </div>
  );
}

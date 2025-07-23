// 더 정확한 디바이스 감지 함수들

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // User Agent 기반 감지 (가장 정확한 방법)
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    "android",
    "webos",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "iemobile",
    "opera mini",
  ];

  const isMobileUA = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  // 모바일 브라우저 패턴 감지
  const mobilePattern = /mobile|android|iphone|ipad|phone/i;
  const isMobilePattern = mobilePattern.test(userAgent);

  // User Agent가 명확히 모바일을 가리키면 true
  if (isMobileUA || isMobilePattern) {
    return true;
  }

  // 데스크톱 브라우저 패턴 감지 (제외할 패턴들)
  const desktopPatterns = [/windows nt/i, /macintosh/i, /linux/i, /x11/i];

  const isDesktop = desktopPatterns.some((pattern) => pattern.test(userAgent));

  // 명확히 데스크톱이면 false
  if (isDesktop && !isMobileUA && !isMobilePattern) {
    return false;
  }

  // 화면 크기 기반 감지 (보조적으로만 사용)
  const isMobileScreen = window.innerWidth <= 480; // 더 작은 크기로 제한

  return isMobileScreen;
};

export const isIOSDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent);

  // iOS 13+ Safari에서 iPad가 desktop으로 표시될 수 있으므로 추가 체크
  const isIPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isIOS || isIPadOS;
};

export const isSafari = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("safari") && !userAgent.includes("chrome");
};

export const shouldUseFallbackRenderer = (): boolean => {
  // iOS나 모바일에서는 항상 fallback 사용
  if (isIOSDevice() || isMobileDevice()) {
    return true;
  }

  // Safari에서도 fallback 사용 (호환성 문제 방지)
  if (isSafari()) {
    return true;
  }

  return false;
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isIOS: isIOSDevice(),
    isSafari: isSafari(),
    shouldUseFallback: shouldUseFallbackRenderer(),
    userAgent: typeof window !== "undefined" ? navigator.userAgent : "unknown",
    screenWidth: typeof window !== "undefined" ? window.innerWidth : 0,
    screenHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  };
};

// 더 정확한 디바이스 감지 함수들

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // User Agent 기반 감지
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
    "mobile",
  ];

  const isMobileUA = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  // 화면 크기 기반 감지
  const isMobileScreen = window.innerWidth <= 768;

  // 터치 지원 감지
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return isMobileUA || (isMobileScreen && isTouchDevice);
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

// Auth related exports
export {
  generateOtp,
  isOtpAuthUrl,
  decodeQRCode,
  parseOtpAuthUrl,
  getRemainingTime,
  getProgressColor,
  generateOtpAuthUrl
} from "./auth"

// Storage related exports
export {
  saveOTP,
  getOTPList,
  isRecoveryCodesSaved,
  checkOtpAuthConfigExist
} from "./storage"

// UI related exports
export {
  highlightElement,
  createSelectionBox,
  startOtpMessageUpdater,
  createGradientTextContainer,
  displayRecoveryCodeSaveMessage
} from "./ui"

// Re-export other modules
export * from "./constant"
export * from "./hooks"
export { default as message } from "./message"
export * from "./helpers"

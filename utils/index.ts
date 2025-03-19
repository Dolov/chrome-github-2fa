import { authenticator } from "otplib"

export function parseOtpauthUrl(otpauthUrl) {
  const url = new URL(otpauthUrl)
  if (url.protocol !== "otpauth:") {
    throw new Error("Invalid OTPAuth URL")
  }

  const type = url.hostname
  const [, account] = url.pathname.split(":")
  const params = Object.fromEntries(new URLSearchParams(url.search))

  return {
    type, // e.g., "totp" or "hotp"
    account,
    secret: params.secret,
    issuer: params.issuer
  }
}

const authenticatorOptions = {
  step: 30,
  digits: 6,
  epoch: Date.now()
}

export const getOtp = (secret, next = false) => {
  authenticatorOptions.epoch = Date.now()
  if (next) {
    authenticatorOptions.epoch =
      authenticatorOptions.epoch + authenticator.options.step * 1000
  }
  authenticator.options = authenticatorOptions
  return authenticator.generate(secret)
}

export const getTimeRemaining = () => {
  authenticatorOptions.epoch = Date.now()
  authenticator.options = authenticatorOptions
  return authenticator.timeRemaining()
}

export const getProcessColor = (time) => {
  // if (time > 25) {
  //   return "progress-success"
  // }
  // if (time > 20) {
  //   return "progress-primary"
  // }
  // if (time > 15) {
  //   return "progress-accent"
  // }
  if (time > 10) {
    return "progress-primary"
  }
  if (time > 3) {
    return "progress-warning"
  }
  return "progress-error"
}

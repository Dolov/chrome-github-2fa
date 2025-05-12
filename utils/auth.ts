import jsQR from "jsqr"
import { authenticator } from "otplib"

import type { OtpAuthConfig } from "./constant"

interface AuthenticatorConfig {
  step: number
  epoch: number
  digits: number
}

const DEFAULT_AUTHENTICATOR_CONFIG: AuthenticatorConfig = {
  step: 30,
  digits: 6,
  epoch: Date.now()
}

/**
 * 解析 OTPAuth URL 为配置对象
 * @param otpauthUrl OTPAuth URL 字符串
 * @throws {Error} 当 URL 格式无效时抛出错误
 */
export const parseOtpAuthUrl = (otpauthUrl: string): OtpAuthConfig => {
  // otpauth://totp/GitHub:acloudfly?secret=N2CNXSJV7LG75BUI&issuer=GitHub
  // otpauth://totp/shisongyan?secret=YMKVIYF4GLUR33S72SLEIWOCOJYSSAPE&issuer=npm

  const url = new URL(otpauthUrl)

  if (url.protocol !== "otpauth:") {
    throw new Error("Invalid URL scheme, must start with otpauth://")
  }

  const type = url.hostname as "totp" | "hotp"
  if (!["totp", "hotp"].includes(type)) {
    throw new Error("Unsupported OTP type. Must be 'totp' or 'hotp'")
  }

  const label = decodeURIComponent(url.pathname.slice(1))
  const [labelIssuer, account] = label.includes(":")
    ? label.split(/:(.+)/)
    : [undefined, label]

  if (!account) {
    throw new Error("Missing account name in OTPAuth URL")
  }

  const params = new URLSearchParams(url.search)

  const secret = params.get("secret")
  if (!secret) throw new Error("Missing 'secret' parameter")

  const issuer = params.get("issuer") ?? labelIssuer

  const algorithmParam = params.get("algorithm")
  const algorithm = algorithmParam
    ? (algorithmParam.toUpperCase() as OtpAuthConfig["algorithm"])
    : undefined

  if (algorithm && !["SHA1", "SHA256", "SHA512", "MD5"].includes(algorithm)) {
    throw new Error(`Unsupported algorithm: ${algorithm}`)
  }

  const digitsParam = params.get("digits")
  const digits = digitsParam ? Number(digitsParam) : undefined
  if (digits !== undefined && ![6, 7, 8].includes(digits)) {
    throw new Error("Digits must be 6, 7, or 8")
  }

  const periodParam = params.get("period")
  const period =
    type === "totp" && periodParam ? Number(periodParam) : undefined

  const counterParam = params.get("counter")
  const counter =
    type === "hotp" && counterParam ? Number(counterParam) : undefined

  if (
    type === "hotp" &&
    (counter === undefined || isNaN(counter) || counter < 0)
  ) {
    throw new Error("HOTP type requires a valid numeric 'counter'")
  }

  return {
    type,
    secret,
    issuer,
    account,
    ...(algorithm && { algorithm }),
    ...(digits !== undefined && { digits }),
    ...(period !== undefined && { period }),
    ...(counter !== undefined && { counter })
  }
}

/**
 * 根据配置生成 OTPAuth URL
 * @param config OTPAuth 配置对象
 */
export function generateOtpAuthUrl(config: OtpAuthConfig): string {
  const { type, account, secret, issuer } = config
  return `otpauth://${type}/${account}?secret=${secret}&issuer=${issuer}`
}

/**
 * 生成 OTP 验证码
 * @param secret 密钥
 * @param generateNext 是否生成下一个周期的验证码
 */
export const generateOtp = (secret: string, generateNext = false): string => {
  const config = { ...DEFAULT_AUTHENTICATOR_CONFIG }
  config.epoch = Date.now()

  if (generateNext) {
    config.epoch += authenticator.options.step * 1000
  }

  authenticator.options = config
  return authenticator.generate(secret)
}

/**
 * 获取当前 OTP 剩余有效时间
 */
export const getRemainingTime = (): number => {
  authenticator.options = {
    ...DEFAULT_AUTHENTICATOR_CONFIG,
    epoch: Date.now()
  }
  return authenticator.timeRemaining()
}

/**
 * 根据剩余时间获取进度条颜色
 * @param timeRemaining 剩余时间（秒）
 */
export const getProgressColor = (timeRemaining: number): string => {
  if (timeRemaining > 10) return "progress-primary"
  if (timeRemaining > 3) return "progress-warning"
  return "progress-error"
}

/**
 * 验证字符串是否为有效的 OTPAuth URL
 * @param data 待验证的字符串
 */
export const isOtpAuthUrl = (data: string): boolean => {
  if (!data) return false
  return data.startsWith("otpauth://")
}

/**
 * 从图片中读取二维码数据
 * @param img HTML 图片元素
 */
export const decodeQRCode = (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    canvas.width = img.width
    canvas.height = img.height
    context.drawImage(img, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      resolve(code.data)
    } else {
      reject(new Error("No QR code found"))
    }
  })
}

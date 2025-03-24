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

export function generateOtpauthUrl({ type, account, secret, issuer }) {
  return `otpauth://${type}/${account}?secret=${secret}&issuer=${issuer}`
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

export const copyTextToClipboard = (text: string) => {
  // 创建一个文本输入框元素
  const textArea = document.createElement("textarea")

  // 设置文本框的值为要复制的文本
  textArea.value = text

  // 将文本框添加到文档中
  document.body.appendChild(textArea)

  // 选中文本框中的文本
  textArea.select()

  try {
    // 尝试执行复制操作
    const successful = document.execCommand("copy")
    const msg = successful ? "已复制到剪贴板" : "复制失败"
    console.log(msg)
  } catch (err) {
    console.error("无法复制文本", err)
  }
  // 移除文本框元素
  document.body.removeChild(textArea)
}

export const downloadBase64Image = (base64Data: string, fileName: string) => {
  // 将 Base64 转换为 Blob
  const byteCharacters = atob(base64Data.split(",")[1]) // 去掉 `data:image/png;base64,` 头部
  const byteNumbers = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const blob = new Blob([byteNumbers], { type: "image/png" })

  // 创建 URL 并下载
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName || "download.png" // 默认文件名
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

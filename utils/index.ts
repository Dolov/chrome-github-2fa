import { authenticator } from "otplib"

import { Storage } from "@plasmohq/storage"

import { StorageKey, type DataProps } from "~utils/constant"

import message from "./message"

export const parseOtpauthUrl = (otpauthUrl: string) => {
  const url = new URL(otpauthUrl)
  if (url.protocol !== "otpauth:") {
    throw new Error("Invalid OTPAuth URL")
  }

  const type = url.hostname
  const [, account] = url.pathname.split(":")
  const params = Object.fromEntries(new URLSearchParams(url.search))

  return {
    type,
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

// 判断二维码中解析出的数据是否符合 otpauth 格式
export const isOtpauthUrl = (data: string) => {
  if (!data) return false
  return data.startsWith("otpauth://")
}

export const extractDynamicPartFromURL = (url: string, pattern: string) => {
  // 将 * 替换成捕获组
  const escapedPattern = pattern
    .replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&") // 转义正则特殊字符
    .replace(/\*/g, "([^/]+)") // 将 * 替换为捕获组

  const regex = new RegExp("^" + escapedPattern + "$") // 精确匹配整个路径

  const match = url.match(regex)
  if (match) {
    return match[1] // 返回捕获的动态部分（即 * 部分的内容）
  }
  return null // 如果没有匹配，返回 null
}

export const startOtpMessageUpdater = (
  input: HTMLInputElement,
  secret: string,
  options?: {
    // 可选CSSStyleDeclaration
    style?: Partial<CSSStyleDeclaration>
    placeholder?: boolean
  }
) => {
  const { style = {}, placeholder } = options || {}
  const renderText = () => {
    const GRADIENT =
      "linear-gradient(to right, \
    #422ad5,   /* 靛蓝 */\
    #00bafe,   /* 湖蓝 */\
    #00d3bb,   /* 青绿 */\
    #00d390,   /* 草绿 */\
    #fcb700,   /* 金黄 */\
    #f43098,   /* 玫红 */\
    #ff637d    /* 粉红 */\
    )"

    const container = document.createElement("div")
    const textElement = document.createElement("p")
    textElement.style.fontSize = "12px"
    textElement.style.fontWeight = "normal"
    textElement.style.color = "transparent"
    textElement.style.background = GRADIENT
    textElement.style.webkitBackgroundClip = "text"
    textElement.style.backgroundClip = "text"
    textElement.style.margin = "0"
    textElement.style.padding = "0"
    container.appendChild(textElement)
    container.style.display = "flex"
    container.style.alignItems = "center"
    // 遍历 style 对象的每个属性
    for (const key in style) {
      if (style[key] !== undefined) {
        container.style[key] = style[key]
      }
    }
    input.insertAdjacentElement("afterend", container)
    return textElement
  }

  const updateOtpMessage = (textElement: HTMLParagraphElement) => {
    const timeRemaining = getTimeRemaining()

    if (placeholder) {
      input.placeholder = `请输入 ${getOtp(secret)}`
    } else {
      input.value = getOtp(secret)
    }
    textElement.textContent = `2FA 自动扫描服务由 gitHub-2fa 扩展提供，感谢您的使用！(有效期：${timeRemaining}秒)`
  }

  const textElement = renderText()
  updateOtpMessage(textElement)
  setInterval(() => updateOtpMessage(textElement), 1000)
}

export const displayRecoveryCodeSaveMessage = (
  element,
  parsedData: Partial<DataProps>
) => {
  const GRADIENT =
    "linear-gradient(to right, \
    #422ad5,   /* 靛蓝 */\
    #00bafe,   /* 湖蓝 */\
    #00d3bb,   /* 青绿 */\
    #00d390,   /* 草绿 */\
    #fcb700,   /* 金黄 */\
    #f43098,   /* 玫红 */\
    #ff637d    /* 粉红 */\
    )"
  const textElement = document.createElement("p")
  textElement.style.fontSize = "12px"
  textElement.style.fontWeight = "normal"
  textElement.style.color = "transparent"
  textElement.style.background = GRADIENT
  textElement.style.webkitBackgroundClip = "text"
  textElement.style.backgroundClip = "text"
  textElement.style.padding = "2px 0"
  textElement.style.cursor = "pointer"

  textElement.style.borderImage = `${GRADIENT} 1% / 5% / 0 stretch`

  element.insertAdjacentElement("afterend", textElement)

  const { account, issuer } = parsedData
  textElement.textContent = `点击保存 ${issuer} - ${account} 的恢复码到 github-2fa 扩展中`
  return textElement
}

export const getGitHubUserName = (): string => {
  const selectors = [
    'meta[property="profile:username"]',
    'meta[name="user-login"]'
  ]

  const meta = selectors
    .map((selector) => document.querySelector(selector))
    .find((el): el is HTMLMetaElement => el !== null)

  return meta?.getAttribute("content") || ""
}

export const save2faToStorage = async (parsed2fa: DataProps) => {
  const storage = new Storage()
  const data: DataProps[] = await storage.get(StorageKey.DATA)
  if (!Array.isArray(data)) return
  const { account, issuer } = parsed2fa
  const existing2fa = data.find(
    (item) =>
      item.account === account &&
      item.issuer?.toLowerCase?.() === issuer?.toLowerCase?.()
  )
  const newData = [...data, parsed2fa]
  await storage.set(StorageKey.DATA, newData)

  if (existing2fa) {
    message.warn(
      `保存成功，扩展内已存在多个 ${issuer} - ${account} 的 2FA 信息，请确认是否为重复添加。`,
      20 * 1000
    )
  } else {
    message.success("已成功保存 npm 账号的 2FA 信息！")
  }
}

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

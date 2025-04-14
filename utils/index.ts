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

const createGradientTextContainer = () => {
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
  textElement.style.margin = "0"
  textElement.style.padding = "0"
  container.appendChild(textElement)

  container.style.flex = "1"
  container.style.display = "flex"
  container.style.alignItems = "center"
  container.style.justifyContent = "center"
  container.style.padding = "2px 0"
  container.style.background = GRADIENT
  container.style.webkitBackgroundClip = "text"
  container.style.backgroundClip = "text"
  container.style.borderImage = `${GRADIENT} 1% / 5% / 0 stretch`
  return { container, textElement }
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
    const { container, textElement } = createGradientTextContainer()
    for (const key in style) {
      if (style[key] !== undefined) {
        container.style[key] = style[key]
      }
    }
    input.insertAdjacentElement("afterend", container)
    return { container, textElement }
  }

  const updateOtpMessage = (textElement: HTMLParagraphElement) => {
    const timeRemaining = getTimeRemaining()

    if (placeholder) {
      input.placeholder = `请输入 ${getOtp(secret)}`
    } else {
      input.value = getOtp(secret)
    }
    textElement.innerHTML = `
      <style>
        .gradient-link {
          color: inherit;
          text-decoration: none;
        }
        .gradient-link:hover {
          text-decoration: underline;
          text-decoration-color: #00d3bb;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }
      </style>
      2FA 服务由 <a class="gradient-link" href="https://github.com/你的项目链接" target="_blank">github-2fa</a> 扩展提供，感谢您的使用！(有效期：${timeRemaining}秒)`
  }

  const { container, textElement } = renderText()
  updateOtpMessage(textElement)
  container.addEventListener("click", () => {
    const code = getOtp(secret)
    copyTextToClipboard(code)
    message.success(`已复制 ${code} 到剪贴板`)
  })
  setInterval(() => updateOtpMessage(textElement), 1000)
}

export const displayRecoveryCodeSaveMessage = (
  element,
  parsedData: DataProps
) => {
  const { container, textElement } = createGradientTextContainer()

  element.insertAdjacentElement("afterend", container)

  const { account, issuer } = parsedData
  textElement.textContent = `点击保存 ${issuer} - ${account} 的恢复码到 github-2fa 扩展中`
  textElement.style.textDecoration = "underline"
  textElement.style.cursor = "pointer"
  container.addEventListener("click", () => {
    save2faToStorage(parsedData)
  })
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
  if (!parsed2fa.id) {
    message.error("保存失败，缺少 ID 信息")
    return
  }
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

export const waitForPathMatchStrict = ({ endsWith }) => {
  // 转义正则特殊字符，并替换 * 为非斜杠字符
  const escaped = endsWith
    .replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&") // 转义正则特殊字符
    .replace(/\*/g, "[^/]+") // * 替换为匹配非斜杠字符

  // 严格匹配
  const endsWithRegex = new RegExp("^" + escaped + "$")

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const currentPath = location.pathname

      // 匹配路径
      if (endsWithRegex.test(currentPath)) {
        // 匹配到就停止定时器
        clearInterval(intervalId)
        resolve(currentPath)
      }
    }, 300)
  })
}

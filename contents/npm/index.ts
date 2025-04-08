import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import { getOtp, getTimeRemaining, parseOtpauthUrl } from "~utils"
import { StorageKey } from "~utils/constant"
import message from "~utils/message"

import { highlightElement, scanQRCode } from "../qr-parse/auto"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/settings/*/tfa"],
  all_frames: false
}

const init = async () => {
  const path = await waitForPathMatchStrict({ endsWith: "/settings/*/tfa/" })
  const result = await scanQRCode()
  if (!result) return
  const { data, element } = result
  highlightElement(element)
  const parsedData = parseOtpauthUrl(data)
  const account = extractDynamicPartFromURL(path, "/settings/*/tfa/")
  const input = document.querySelector(
    "input[id='enable_otp']"
  ) as HTMLInputElement
  if (!input) return

  const textElement = createTextElement()
  const { secret } = parsedData
  // 插入到 input 元素下方
  input.insertAdjacentElement("afterend", textElement)
  input.value = getOtp(secret)

  updateText(input, secret, textElement)

  // 定时更新文案和 OTP
  setInterval(() => updateText(input, secret, textElement), 1000)

  const submitButton = document.querySelector(
    "button[type='submit']"
  ) as HTMLButtonElement
  if (!submitButton) return

  submitButton.addEventListener("click", () => {
    if (!input.value) return
    updateStorage({
      ...parsedData,
      account
    })
  })
}

function waitForPathMatchStrict({ endsWith }) {
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

function extractDynamicPartFromURL(url, pattern) {
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

// 创建提示文字元素
const createTextElement = (): HTMLParagraphElement => {
  const GRADIENT =
    "linear-gradient(to right, #3b82f6, #9333ea, #f472b6, #f59e0b)" // DaisyUI 渐变色

  const textElement = document.createElement("p")
  textElement.textContent = "2FA 自动填充服务由 GitHub 2FA 提供，感谢您的使用！"

  // 设置样式
  textElement.style.fontSize = "12px"
  textElement.style.fontWeight = "normal"
  textElement.style.color = "transparent"
  textElement.style.background = GRADIENT
  textElement.style.webkitBackgroundClip = "text"
  textElement.style.backgroundClip = "text"
  textElement.style.padding = "2px 0"

  return textElement
}

// 动态更新文案内容
const updateText = (
  input: HTMLInputElement,
  secret: string,
  textElement: HTMLParagraphElement
) => {
  const timeRemaining = getTimeRemaining()
  textElement.textContent = `2FA 自动填充服务由 GitHub 2FA 提供，感谢您的使用！(有效期：${timeRemaining}秒)`

  if (timeRemaining >= 1) return
  // 如果 OTP 过期，重新填充新的 OTP
  input.value = getOtp(secret)
}

const updateStorage = async (parsed2fa) => {
  const storage = new Storage()
  const data = await storage.get(StorageKey.DATA)
  const newData = [...data, parsed2fa]
  await storage.set(StorageKey.DATA, newData)
  message.success("npm 2FA 信息已保存。")
}

init()

export {}

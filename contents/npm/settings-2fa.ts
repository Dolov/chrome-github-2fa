import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import {
  extractDynamicPartFromURL,
  parseOtpauthUrl,
  startOtpMessageUpdater
} from "~utils"
import { StorageKey, type DataProps } from "~utils/constant"
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

  const { secret } = parsedData

  startOtpMessageUpdater(input, secret)

  const submitButton = document.querySelector(
    "button[type='submit']"
  ) as HTMLButtonElement
  if (!submitButton) return

  submitButton.addEventListener("click", () => {
    if (!input.value) return
    updateStorage({
      ...parsedData,
      id: Date.now().toString(),
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

const updateStorage = async (parsed2fa: DataProps) => {
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
      "已保存 2FA 信息，但该 npm 账号记录已存在，请确认是否为重复添加或更新。",
      20 * 1000
    )
  } else {
    message.success("已成功保存 npm 账号的 2FA 信息！")
  }
}

init()

export {}

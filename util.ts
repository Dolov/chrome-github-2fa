import { authenticator } from "otplib"

import { Storage } from "@plasmohq/storage"

export const authenticatorOptions = {
  step: 30,
  digits: 6
}

// 配置身份验证器
authenticator.options = authenticatorOptions

export { authenticator }

const DATA_SOURCE = "DATA_SOURCE"

export const storage = new Storage()

export interface DataProps {
  type?: string
  issuer?: string
  secret?: string
  account: string
  recoveryCodes?: { value: string; copyed: boolean }[]
}

class DataSource {
  storageKey: string
  constructor(key: string) {
    this.storageKey = key
  }

  async set(account: DataProps["account"], params: DataProps) {
    const store = (await storage.get(this.storageKey)) || {}
    store[account] = {
      ...store[account],
      ...params
    }
    return await storage.set(this.storageKey, store)
  }

  async get(): Promise<Record<string, DataProps>> {
    return (await storage.get(this.storageKey)) || {}
  }

  async setRecoveryCodes(account, codes) {
    const store = await this.get()
    store[account] = {
      ...store[account],
      account,
      recoveryCodes: codes
    }
    return await this.set(account, store[account])
  }

  async save(data) {
    return await storage.set(this.storageKey, data)
  }
}

export const dataSource = new DataSource(DATA_SOURCE)

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

/** 同步谷歌时间 */
export const syncTimeWithGoogle = async () => {
  const res = await fetch("https://www.google.com/generate_204")
  const serverDate = res.headers.get("date")
  const serverTime = new Date(serverDate).getTime()
  const clientTime = new Date().getTime()
  const offset = Math.round((serverTime - clientTime) / 1000)

  return {
    offset,
    clientTime,
    serverTime
  }
}

export const getUserName = () => {
  const meta1 = document.querySelector('meta[property="profile:username"]')
  if (meta1) {
    const userName = meta1.getAttribute("content") || ""
    return userName
  }
  const meta2 = document.querySelector('meta[name="user-login"]')
  if (meta2) {
    const userName = meta2.getAttribute("content") || ""
    return userName
  }
  return ""
}

export const goSettingSecurity = () => {
  chrome.tabs.create({
    url: "https://github.com/settings/security?type=app#two-factor-summary"
  })
}

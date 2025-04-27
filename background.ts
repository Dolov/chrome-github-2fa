import { Storage } from "@plasmohq/storage"

import { ActionKey, StorageKey } from "~utils/constant"

/** 定义右键菜单列表 */
const menuList: (chrome.contextMenus.CreateProperties & {
  action?(tab: chrome.tabs.Tab): void
})[] = [
  {
    id: "issue",
    title: "Issues & 需求",
    contexts: ["action"],
    action() {
      chrome.tabs.create({
        url: "https://github.com/Dolov/chrome-github-2fa/issues"
      })
    }
  },
  {
    id: "source",
    title: "查看源码",
    contexts: ["action"],
    action() {
      chrome.tabs.create({
        url: "https://github.com/Dolov/chrome-github-2fa"
      })
    }
  },
  {
    id: "settings",
    title: "设置",
    contexts: ["action"],
    action() {
      chrome.tabs.create({
        url: "tabs/settings.html"
      })
    }
  }
]

/** 创建右键菜单 */
menuList.forEach((item) => {
  const { action, ...menuProps } = item
  chrome.contextMenus.create(menuProps)
})

/** 监听右键菜单的点击事件，执行对应的行为 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId } = info
  const menu = menuList.find((item) => item.id === menuItemId)
  if (!menu) return
  const { action } = menu
  action && action(tab)
})

export {}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === ActionKey.CAPTURE_SCREENSHOT) {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ success: !!dataUrl, image: dataUrl })
    })
    return true
  }
})

const adptLegacyData = async () => {
  const storage = new Storage()
  const data = await storage.get(StorageKey.DATA)
  if (Array.isArray(data) && data.length) return

  const legacyData = await storage.get(StorageKey.LEGACY_DATA)
  if (!legacyData) return
  const keys = Object.keys(legacyData)
  if (!keys.length) return
  const list = keys.map((key) => {
    const item = legacyData[key]
    const { account, issuer, secret } = item
    const recoveryCodes = item.recoveryCodes || []
    return {
      issuer,
      secret,
      account,
      id: `${key}-${Date.now()}`,
      type: "totp",
      recoveryCodes: recoveryCodes.map((item) => {
        const { value, copyed } = item
        return {
          value,
          copied: copyed
        }
      })
    }
  })
  await storage.set(StorageKey.DATA, list)
}

adptLegacyData()

import { Storage } from "@plasmohq/storage"

import { ActionType, StorageKey } from "~utils/constant"

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

// 监听来自 content script 的消息，进行截图，并返回截图结果，让 content script 获取对应区域的二维码
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === ActionType.CAPTURE_SCREENSHOT) {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ success: !!dataUrl, image: dataUrl })
    })
    return true
  }
})

// 将 v1 版本的数据迁移到新数据格式
const adptLegacyData = async () => {
  const storage = new Storage()
  const data = await storage.get(StorageKey.DATA)
  if (Array.isArray(data) && data.length) return

  const legacyData = await storage.get(StorageKey.LEGACY_DATA)
  if (!legacyData) return
  const keys = Object.keys(legacyData)
  if (!keys.length) return
  const list = keys
    .map((key) => {
      const item = legacyData[key]
      // 需要检查必要字段是否存在
      if (!item?.secret || !item?.issuer || !item?.account) {
        return null
      }
      const { account, issuer, secret } = item
      const recoveryCodes = Array.isArray(item.recoveryCodes)
        ? item.recoveryCodes
        : []
      return {
        issuer,
        secret,
        account,
        id: `${key}-${Date.now()}`, // 多个数据同时迁移时可能会有重复ID的问题
        type: "totp",
        recoveryCodes: recoveryCodes
          .map((code) => {
            if (!code?.value) return null
            const { value, copyed } = code
            return {
              value,
              copied: !!copyed // 确保是布尔值
            }
          })
          .filter(Boolean) // 过滤掉无效的恢复码
      }
    })
    .filter(Boolean) // 过滤掉无效的数据项

  if (list.length) {
    try {
      await storage.set(StorageKey.DATA, list)
    } catch (error) {
      console.error("Legacy data migration failed:", error)
    }
  }
}

adptLegacyData()

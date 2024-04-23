
/** 定义右键菜单列表 */
const menuList: (chrome.contextMenus.CreateProperties & { action?(tab: chrome.tabs.Tab): void })[] = [
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
    id: "document",
    title: "使用文档",
    contexts: ["action"],
    action() {
      chrome.tabs.create({
        url: "https://github.com/Dolov/chrome-github-2fa/issues/1"
      })
    }
  },
]

/** 创建右键菜单 */
menuList.forEach(item => {
  const { action, ...menuProps } = item
  chrome.contextMenus.create(menuProps);
})

/** 监听右键菜单的点击事件，执行对应的行为 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId } = info
  const menu = menuList.find(item => item.id === menuItemId)
  if (!menu) return
  const { action } = menu
  action && action(tab)
});

export {

}
import jsQR from "jsqr"

// 复制文本到剪贴板
export const copyTextToClipboard = (text: string) => {
  const textArea = document.createElement("textarea")
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()

  try {
    const successful = document.execCommand("copy")
    const msg = successful ? "已复制到剪贴板" : "复制失败"
    console.log(msg)
  } catch (err) {
    console.error("无法复制文本", err)
  }
  document.body.removeChild(textArea)
}

export const copyTextToClipboardV2 = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log("已复制到剪贴板")
  } catch (err) {
    console.error("复制失败", err)
  }
}

// 下载Base64图片
export const downloadBase64Image = (base64Data: string, fileName: string) => {
  const byteCharacters = atob(base64Data.split(",")[1])
  const byteNumbers = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const blob = new Blob([byteNumbers], { type: "image/png" })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName || "download.png"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 检查是否可注入内容脚本
export const canInjectContentScript = async (): Promise<boolean> => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]

    if (!currentTab?.id) {
      return false
    }

    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => true
    })

    return true
  } catch (error) {
    return false
  }
}

// 等待DOM元素出现
export const waitForElement = <T extends Element = Element>(
  selector: string,
  once = false
): Promise<T> => {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector)
    if (existing) {
      resolve(existing as T)
      return
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue

          const target = node.matches?.(selector)
            ? node
            : node.querySelector?.(selector)

          if (target) {
            if (once) {
              observer.disconnect()
            }
            resolve(target as T)
            return
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

// 从URL提取动态段
export const extractDynamicSegment = (
  url: string,
  template: string | string[]
) => {
  const templates = Array.isArray(template) ? template : [template]

  for (const t of templates) {
    const templateRegex = t
      .replace(/\//g, "\\/") // 转义斜杠
      .replace(/\*/g, "([^/]+)") // 将 * 替换为捕获分组

    const match = url.match(new RegExp(templateRegex))
    if (match) {
      return match[1]
    }
  }

  return null
}

// 等待URL路径匹配
export const waitForPathMatchStrict = ({
  endsWith
}: {
  endsWith: string | string[]
}): Promise<string | null> => {
  const patterns = Array.isArray(endsWith) ? endsWith : [endsWith]

  const regexList = patterns.map((pattern) => {
    const escaped = pattern
      .replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&") // 转义特殊字符
      .replace(/\*/g, "[^/?#]+") // * 匹配非 /、?、# 的片段

    return new RegExp(escaped + "$") // 只需确保"以这个结尾"
  })

  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      const fullUrl = location.href

      const matched = regexList.some((regex) => regex.test(fullUrl))
      if (matched) {
        clearInterval(intervalId)
        resolve(fullUrl)
      }
    }, 300)
  })
}

// 从图片读取二维码
export const readQRCodeFromImage = (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return reject(new Error("无法获取 Canvas 上下文"))

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0, img.width, img.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    code ? resolve(code.data) : reject(new Error("未找到二维码"))
  })
}

// 从文件读取二维码
export const readQRCodeFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        readQRCodeFromImage(img).then(resolve).catch(reject)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const sleep = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

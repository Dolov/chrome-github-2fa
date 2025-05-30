import jsQR from "jsqr"

// Copy text to clipboard (fallback method)
export const copyTextToClipboard = (text: string) => {
  const textArea = document.createElement("textarea") // Create a temporary textarea
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()

  try {
    const successful = document.execCommand("copy") // Try to execute copy command
    const msg = successful ? "已复制到剪贴板" : "复制失败" // Success or failure message
    console.log(msg)
  } catch (err) {
    console.error("无法复制文本", err) // Error copying text
  }
  document.body.removeChild(textArea) // Clean up
}

// Copy text to clipboard using Clipboard API (modern method)
export const copyTextToClipboardV2 = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text) // Use Clipboard API
    console.log("已复制到剪贴板")
  } catch (err) {
    console.error("复制失败", err)
  }
}

/** Sync local time with Google's server time */
export const syncTimeWithGoogle = async () => {
  const res = await fetch("https://www.google.com/generate_204") // Fetch a lightweight Google endpoint
  const serverDate = res.headers.get("date") // Get server date header
  const serverTime = new Date(serverDate).getTime() // Convert to timestamp
  const clientTime = new Date().getTime() // Local timestamp
  const offset = Math.round((serverTime - clientTime) / 1000) // Calculate offset in seconds

  return {
    offset,
    clientTime,
    serverTime
  }
}

// Download a Base64-encoded image as a file
export const downloadBase64Image = (base64Data: string, fileName: string) => {
  const byteCharacters = atob(base64Data.split(",")[1]) // Decode base64
  const byteNumbers = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const blob = new Blob([byteNumbers], { type: "image/png" }) // Create blob

  const url = URL.createObjectURL(blob) // Create object URL
  const a = document.createElement("a") // Create download link
  a.href = url
  a.download = fileName || "download.png"
  document.body.appendChild(a)
  a.click() // Trigger download
  document.body.removeChild(a)
  URL.revokeObjectURL(url) // Clean up
}

// Check if content script can be injected into the current tab
export const canInjectContentScript = async (): Promise<boolean> => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true }) // Get current active tab
    const currentTab = tabs[0]

    if (!currentTab?.id) {
      return false
    }

    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => true // Try to execute a simple script
    })

    return true // Injection successful
  } catch (error) {
    return false // Injection failed
  }
}

// Wait for a DOM element to appear in the document
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

          // Check if the added node matches the selector
          const target = node.matches?.(selector)
            ? node
            : node.querySelector?.(selector)

          if (target) {
            if (once) {
              observer.disconnect() // Stop observing if only once
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

// Extract dynamic segment from URL based on template
export const extractDynamicSegment = (
  url: string,
  template: string | string[]
) => {
  const templates = Array.isArray(template) ? template : [template]

  for (const t of templates) {
    const templateRegex = t
      .replace(/\//g, "\\/") // Escape slashes
      .replace(/\*/g, "([^/]+)") // Replace * with capture group

    const match = url.match(new RegExp(templateRegex))
    if (match) {
      return match[1] // Return the captured segment
    }
  }

  return null
}

// Wait for the URL path to strictly match a pattern (or patterns)
export const waitForPathMatchStrict = ({
  endsWith
}: {
  endsWith: string | string[]
}): Promise<string | null> => {
  const patterns = Array.isArray(endsWith) ? endsWith : [endsWith]

  const regexList = patterns.map((pattern) => {
    const escaped = pattern
      .replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&") // Escape special characters
      .replace(/\*/g, "[^/?#]+") // * matches any non-/, ?, # segment

    return new RegExp(escaped + "$") // Ensure it ends with the pattern
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

// Read QR code from an image element
export const readQRCodeFromImage = (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return reject(new Error("无法获取 Canvas 上下文")) // Cannot get canvas context

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0, img.width, img.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height) // Decode QR

    code ? resolve(code.data) : reject(new Error("未找到二维码")) // Not found
  })
}

// Read QR code from a file (image file)
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

// Sleep for a given number of milliseconds
export const sleep = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

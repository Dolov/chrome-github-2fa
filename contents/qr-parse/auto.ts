import jsQR from "jsqr"
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"

import { ActionKey } from "~utils/constant"

const containerId = "github-2fa-container-1742783738736"
export const getShadowHostId: PlasmoGetShadowHostId = () => containerId

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// 监听消息并确保发送响应
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === ActionKey.AUTOSCAN) {
    scanQRCode()
      .then((result) => {
        highlightElement(result.element)
        sendResponse({ success: true, data: result.data })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
  }

  return true
})

// 🎯 依次尝试解析二维码（canvas > img）
const scanQRCode = async (): Promise<{
  data: string
  element: HTMLElement
}> => {
  const canvases = Array.from(document.querySelectorAll("canvas"))
  for (const canvas of canvases) {
    try {
      const data = await readQRCodeFromCanvas(canvas)
      return { data, element: canvas }
    } catch (error) {}
  }

  const images = Array.from(document.querySelectorAll("img"))
  for (const img of images) {
    try {
      const data = await readQRCodeFromImage(img)
      return { data, element: img }
    } catch (error) {}
  }

  throw new Error("未找到有效的二维码")
}

// 🎯 解析 <canvas> 里的二维码
const readQRCodeFromCanvas = (canvas: HTMLCanvasElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return reject(new Error("无法获取 Canvas 上下文"))

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    code ? resolve(code.data) : reject(new Error("未找到二维码"))
  })
}

// 🎯 解析 <img> 里的二维码
const readQRCodeFromImage = (img: HTMLImageElement): Promise<string> => {
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

// 🎯 高亮二维码
const highlightElement = (element: HTMLElement) => {
  const colors = [
    "#4a00ff",
    "#ff00d3",
    "#00b6ff",
    "#00a96e",
    "#ffbe00",
    "#ff5861"
  ]
  let index = 0
  let count = 0
  const maxBlinks = 6

  element.style.transition = "box-shadow 0.3s ease"

  const interval = setInterval(() => {
    element.style.boxShadow = `0 0 10px 4px ${colors[index]}`
    index = (index + 1) % colors.length
    count++

    if (count >= maxBlinks) {
      clearInterval(interval)
      setTimeout(() => {
        element.style.boxShadow = "none"
      }, 500)
    }
  }, 500)
}

export { scanQRCode, highlightElement }

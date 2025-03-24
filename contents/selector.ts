import jsQR from "jsqr"
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from "plasmo"

import { ActionKey, contentBaseZindex } from "~utils/constant"
import { isOtpauthUrl, message } from "~utils/content-utils"

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

  if (message.action === ActionKey.MANUAL_SCREENSHOT) {
    addScreenshotOverlay(sendResponse)
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

// 🎯 选取截图区域
const addScreenshotOverlay = (sendResponse) => {
  const overlay = document.createElement("div")
  overlay.style.position = "fixed"
  overlay.style.top = "0"
  overlay.style.left = "0"
  overlay.style.width = "100vw"
  overlay.style.height = "100vh"
  overlay.style.background = "rgba(0, 0, 0, 0.5)"
  overlay.style.zIndex = `${contentBaseZindex}`
  overlay.style.cursor = "crosshair"
  document.body.appendChild(overlay)

  const messageVm = message.info("未检测到二维码，开启手动截图模式", 20000)

  const handleEsc = (e) => {
    if (e.key !== "Escape") return
    dismissAll()
  }

  const dismissAll = () => {
    overlay.remove()
    messageVm.destroy()
    selectionBox && selectionBox.remove()
    document.removeEventListener("keydown", handleEsc)
    document.removeEventListener("mouseup", handleMouseUp)
    document.removeEventListener("mousemove", handleMouseMove)
  }

  let startX, startY, endX, endY, selectionBox

  overlay.addEventListener("mousedown", (e) => {
    startX = e.clientX
    startY = e.clientY

    selectionBox = document.createElement("div")
    selectionBox.style.position = "fixed"
    selectionBox.style.border = "2px dashed red"
    selectionBox.style.background = "rgba(255, 0, 0, 0.2)"
    selectionBox.style.zIndex = `${contentBaseZindex + 1}`
    document.body.appendChild(selectionBox)
  })

  const handleMouseMove = (e) => {
    if (!selectionBox) return
    endX = e.clientX
    endY = e.clientY

    selectionBox.style.left = Math.min(startX, endX) + "px"
    selectionBox.style.top = Math.min(startY, endY) + "px"
    selectionBox.style.width = Math.abs(endX - startX) + "px"
    selectionBox.style.height = Math.abs(endY - startY) + "px"
  }

  const handleMouseUp = (e) => {
    if (!selectionBox) return
    dismissAll()

    chrome.runtime.sendMessage(
      { action: ActionKey.CAPTURE_SCREENSHOT },
      async (response) => {
        if (!response.success) {
          message.error("截图失败")
          return
        }

        const qrData = await cropImage(
          response.image,
          startX,
          startY,
          endX - startX,
          endY - startY
        ).catch((error) => {
          message.error(`解析二维码失败：${error.message}`)
        })
        if (!qrData) return
        const available = isOtpauthUrl(qrData)
        if (!available) {
          message.warn(
            `检测到二维码，但其格式【${qrData}】不符合 OTPAuth 规范`,
            10000
          )
          return
        }
        message.success("二维码解析成功")
      }
    )
  }

  document.addEventListener("keydown", handleEsc)
  document.addEventListener("mouseup", handleMouseUp)
  document.addEventListener("mousemove", handleMouseMove)
}

// 🎯 裁剪截图并解析二维码
const cropImage = (dataUrl, x, y, width, height): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = dataUrl
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1

      // 创建 canvas 元素
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // 设置画布的实际像素尺寸为裁剪区域的大小
      canvas.width = width * dpr
      canvas.height = height * dpr

      // 裁剪图像并绘制到画布
      ctx.drawImage(
        img,
        x * dpr,
        y * dpr,
        width * dpr,
        height * dpr,
        0,
        0,
        width * dpr,
        height * dpr
      )

      // 将裁剪后的画布转换为 Data URL（如果需要）
      const croppedDataUrl = canvas.toDataURL("image/png")
      decodeQRCode(croppedDataUrl).then(resolve).catch(reject)

      // debug 模式，将 canvas 内容插入在页面上
      if (process.env.NODE_ENV === "development") {
        canvas.style.position = "fixed"
        canvas.style.top = "0"
        canvas.style.left = "0"
        canvas.style.zIndex = `${contentBaseZindex + 1}`
        canvas.style.border = "2px solid #2196F3"
        canvas.addEventListener("click", () => {
          canvas.remove()
        })
        document.body.appendChild(canvas)
      }
    }
    img.onerror = reject
  })
}

// 🎯 解析截图中二维码的内容
const decodeQRCode = (imageDataUrl: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageDataUrl
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(image, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) resolve(code.data)
      else reject(new Error("无法识别的二维码"))
    }
    image.onerror = () => reject(new Error("图片加载失败"))
  })
}

import type { PlasmoCSConfig } from "plasmo"

import {
  highlightElement,
  isOtpauthUrl,
  parseOtpauthUrl,
  readQRCodeFromImage,
  save2faToStorage,
  startOtpMessageUpdater,
  waitForElement
} from "~utils"
import { type DataProps } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"],
  all_frames: false
}

export const waitQRCodeImage = async () => {
  const qrImg = await waitForElement<HTMLImageElement>("img.qr-code-img")
  let parsedData: Awaited<ReturnType<typeof parseImage2faUrl>> | null = null

  const processImage = async () => {
    parsedData = await parseImage2faUrl(qrImg)
  }

  // 如果图片已加载
  if (qrImg.complete && qrImg.naturalWidth !== 0) {
    await processImage()
  } else {
    qrImg.onload = processImage
  }

  const saveButton = document.querySelector<HTMLButtonElement>(
    "button[data-target='two-factor-configure-otp-factor.saveButton']"
  )

  if (!saveButton) return

  saveButton.addEventListener("click", async (e) => {
    if (!parsedData) return

    await save2faToStorage({
      ...parsedData,
      id: Date.now().toString()
    })
  })
}

const parseImage2faUrl = async (
  qrImg: HTMLImageElement
): Promise<Omit<DataProps, "id"> | null> => {
  const url = await readQRCodeFromImage(qrImg)
  if (!isOtpauthUrl(url)) return null

  highlightElement(qrImg)

  const parsedData = parseOtpauthUrl(url)
  const { secret } = parsedData

  const input = document.querySelector<HTMLInputElement>(
    "input[data-target='two-factor-configure-otp-factor.appOtpInput']"
  )

  if (input && secret) {
    startOtpMessageUpdater(input, secret, {
      style: { marginLeft: "16px" },
      placeholder: true
    })
  }

  return parsedData
}

waitQRCodeImage()

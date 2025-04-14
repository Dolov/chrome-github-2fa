import type { PlasmoCSConfig } from "plasmo"

import {
  copyTextToClipboard,
  displayRecoveryCodeSaveMessage,
  getOtp,
  parseOtpauthUrl,
  save2faToStorage,
  sleep,
  startOtpMessageUpdater,
  waitForPathMatchStrict
} from "~utils"

import { highlightElement, scanQRCode } from "../qr-parse/auto"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/settings/security?type=app"],
  all_frames: false
}

const init = async () => {
  const suffix = "/settings/security?type=app#two-factor-summary"
  if (!location.href.endsWith(suffix)) return
  const qrImg = document.querySelector("img.qr-code-img") as HTMLImageElement
  if (!qrImg) return
  const result = await scanQRCode()
  if (!result) return
  const { data, element } = result
  highlightElement(element)
  const parsedData = parseOtpauthUrl(data)
  const { secret } = parsedData
  const input = document.querySelector(
    "input[data-target='two-factor-configure-otp-factor.appOtpInput']"
  ) as HTMLInputElement

  startOtpMessageUpdater(input, secret, {
    style: {
      marginLeft: "16px"
    },
    placeholder: true
  })

  copyTextToClipboard(getOtp(secret))

  const saveButton = document.querySelector(
    "button[data-target='two-factor-configure-otp-factor.saveButton']"
  )
  saveButton.addEventListener("click", (e) => {
    // update
  })
}

init()

export {}

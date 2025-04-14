import type { PlasmoCSConfig } from "plasmo"

import {
  extractDynamicPartFromURL,
  parseOtpauthUrl,
  save2faToStorage,
  startOtpMessageUpdater,
  waitForPathMatchStrict
} from "~utils"

import { highlightElement, scanQRCode } from "../qr-parse/auto"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/settings/*/tfa"],
  all_frames: false
}

const init = async () => {
  const path = await waitForPathMatchStrict({ endsWith: "/settings/*/tfa/" })
  const result = await scanQRCode()
  if (!result) return
  const { data, element } = result
  highlightElement(element)
  const parsedData = parseOtpauthUrl(data)
  const account = extractDynamicPartFromURL(path, "/settings/*/tfa/")
  const input = document.querySelector(
    "input[id='enable_otp']"
  ) as HTMLInputElement
  if (!input) return

  const { secret } = parsedData

  startOtpMessageUpdater(input, secret)

  const submitButton = document.querySelector(
    "button[type='submit']"
  ) as HTMLButtonElement
  if (!submitButton) return

  submitButton.addEventListener("click", () => {
    if (!input.value) return
    save2faToStorage({
      ...parsedData,
      id: Date.now().toString(),
      account
    })
  })
}

init()

export {}

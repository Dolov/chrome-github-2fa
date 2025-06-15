import type { PlasmoCSConfig } from "plasmo"

import message from "~/utils/message"
import {
  extractDynamicSegment,
  highlightElement,
  parseOtpAuthUrl,
  saveOTP,
  startOtpMessageUpdater,
  waitForPathMatchStrict
} from "~utils"

import { scanQRCode } from "./auto"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.npmjs.com/settings/*/tfa",
    "https://www.npmjs.com/settings/*/tfa/list",
    // replace
    "https://www.npmjs.com/settings/*/tfa/manageTfa?action=setup-totp"
  ],
  all_frames: false
}

const init = async () => {
  const href = await waitForPathMatchStrict({
    endsWith: [
      "/settings/*/tfa/",
      "/settings/*/tfa/manageTfa?action=setup-totp"
    ]
  })
  if (!href) return
  const result = await scanQRCode()
  if (!result) return
  const { data, element } = result
  highlightElement(element)
  const parsedData = parseOtpAuthUrl(data)
  const account = extractDynamicSegment(href, "/settings/*/tfa/")
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

  submitButton.addEventListener("click", async () => {
    if (!input.value) return
    await saveOTP({
      ...parsedData,
      account,
      id: Date.now().toString()
    })
    message.success("添加成功")
  })
}

init()

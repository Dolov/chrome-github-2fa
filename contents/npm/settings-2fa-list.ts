import type { PlasmoCSConfig } from "plasmo"

import {
  extractDynamicPartFromURL,
  get2faListFromStorage,
  startOtpMessageUpdater,
  waitForElement
} from "~utils"
import { Issuers } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/settings/*/tfa/list"],
  all_frames: false
}

const init = async () => {
  const input = await waitForElement<HTMLInputElement>("input[id='login_otp']")

  const account = extractDynamicPartFromURL(
    window.location.pathname,
    "/settings/*/tfa/list"
  )
  const data = await get2faListFromStorage(Issuers.NPM, account)
  if (data.length === 0) return
  if (data.length === 1) {
    const { secret } = data[0]
    startOtpMessageUpdater(input, secret)
    return
  }
}

init()

export {}

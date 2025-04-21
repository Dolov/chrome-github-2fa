import type { PlasmoCSConfig } from "plasmo"

import {
  extractDynamicSegment,
  get2faListFromStorage,
  startOtpMessageUpdater,
  waitForElement
} from "~utils"
import { Issuers } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/*"],
  all_frames: false
}

export const waitConfirmAccess = async () => {
  const input = await waitForElement<HTMLInputElement>(
    "input[id=login_otp]",
    false
  )
  const account = extractDynamicSegment(location.href, "/settings/*/tfa/")
  const issuer = Issuers.NPM
  const data = await get2faListFromStorage(issuer, account)
  if (data.length === 0) return
  startOtpMessageUpdater(input, data[0].secret, {
    style: {
      marginBottom: "16px"
    }
  })
}

waitConfirmAccess()

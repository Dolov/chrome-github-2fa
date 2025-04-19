import type { PlasmoCSConfig } from "plasmo"

import {
  get2faListFromStorage,
  startOtpMessageUpdater,
  waitForElement
} from "~utils"
import { Issuers } from "~utils/constant"

import { getGitHubUserName } from "./utils"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"],
  all_frames: false
}

export const waitConfirmAccess = async () => {
  const input = await waitForElement<HTMLInputElement>(
    "input[id=app_totp][name=sudo_app_otp]",
    false
  )
  const account = getGitHubUserName()
  const issuer = Issuers.GITHUB
  const data = await get2faListFromStorage(issuer, account)
  if (data.length === 0) return
  startOtpMessageUpdater(input, data[0].secret, {
    style: {
      marginBottom: "16px"
    }
  })
}

waitConfirmAccess()

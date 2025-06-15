import type { PlasmoCSConfig } from "plasmo"

import {
  displayRecoveryCodeSaveMessage,
  extractDynamicSegment,
  getOTPList
} from "~utils"
import { Issuers } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/settings/*/recovery-codes"],
  all_frames: false
}

const init = async () => {
  const account = extractDynamicSegment(
    location.href,
    "/settings/*/recovery-codes"
  )
  if (!account) return
  const data = await getOTPList(Issuers.NPM, account)
  if (data.length === 0) return
  const container = document.querySelector(
    'div[role="button"][tabindex="0"]'
  ) as HTMLInputElement
  const pTags = container.querySelectorAll("p")
  const codes = Array.from(pTags)
    .map((p) => p.innerText)
    .filter((p) => p.length > 0)

  if (codes.length === 0) return

  displayRecoveryCodeSaveMessage(
    container,
    {
      ...data[0],
      recoveryCodes: codes.map((p) => ({ value: p, copied: false }))
    },
    {
      containerStyle: {
        marginBottom: "16px"
      }
    }
  )
}

init()

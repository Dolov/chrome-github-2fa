import type { PlasmoCSConfig } from "plasmo"

import {
  displayRecoveryCodeSaveMessage,
  extractDynamicPartFromURL
} from "~utils"
import { Issuers, StorageKey, type DataProps } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/settings/*/recovery-codes"],
  all_frames: false
}

const init = async () => {
  const container = document.querySelector(
    'div[role="button"][tabindex="0"]'
  ) as HTMLInputElement
  const pTags = container.querySelectorAll("p")
  const codes = Array.from(pTags)
    .map((p) => p.innerText)
    .filter((p) => p.length > 0)
  if (codes.length === 0) return

  const account = extractDynamicPartFromURL(
    window.location.pathname,
    "/settings/*/recovery-codes"
  )
  displayRecoveryCodeSaveMessage(container, codes, {
    account,
    issuer: Issuers.NPM
  })
}

init()

export {}

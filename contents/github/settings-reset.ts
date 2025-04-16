import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import {
  copyTextToClipboard,
  displayRecoveryCodeSaveMessage,
  getGitHubUserName,
  getOtp,
  onElementAppear,
  parseOtpauthUrl,
  save2faToStorage,
  sleep,
  startOtpMessageUpdater,
  waitForPathMatchStrict
} from "~utils"
import { Issuers, StorageKey } from "~utils/constant"

import { highlightElement, scanQRCode } from "../qr-parse/auto"

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/settings/security",
    "https://github.com/settings/security?type=app",
    "https://github.com/settings/security?type=app#two-factor-summary"
  ],
  all_frames: false
}

const storage = new Storage()

const init = async () => {
  waitForValidate()
  console.info("2fa loaded")
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

// 如果已经配置过 2fa, 重新进入配置页需要验证
const waitForValidate = async () => {
  onElementAppear("input[id=app_totp]", (input: HTMLInputElement) => {
    storage.get(StorageKey.DATA).then((data) => {
      if (!Array.isArray(data)) return
      const account = getGitHubUserName()
      const issuer = Issuers.GITHUB
      const existing2fa = data.find(
        (item) =>
          item.account === account &&
          item.issuer?.toLowerCase?.() === issuer?.toLowerCase?.()
      )
      if (!existing2fa) return
      startOtpMessageUpdater(input, existing2fa.secret, {
        style: {
          marginBottom: "16px"
        }
      })
    })
  })
}

init()

export {}

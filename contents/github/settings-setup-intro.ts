import type { PlasmoCSConfig } from "plasmo"

import {
  copyTextToClipboard,
  displayRecoveryCodeSaveMessage,
  getOtp,
  onElementAppear,
  parseOtpauthUrl,
  sleep,
  startOtpMessageUpdater
} from "~utils"

import { highlightElement, scanQRCode } from "../qr-parse/auto"

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/settings/two_factor_authentication/setup/intro"
  ],
  all_frames: false
}

const init = async () => {
  const qrImg = document.querySelector("img.qr-code-img") as HTMLImageElement
  if (!qrImg) return

  // 等待二维码加载完成
  qrImg.onload = async () => {
    const result = await scanQRCode()
    if (!result) return
    const { data, element } = result
    highlightElement(element)
    const parsedData = parseOtpauthUrl(data)
    const { secret } = parsedData
    console.log("parsedData: ", parsedData)
    const input = document.querySelector(
      "input[data-target='two-factor-setup-verification.appOtpInput']"
    ) as HTMLInputElement

    startOtpMessageUpdater(input, secret, {
      style: {
        marginLeft: "16px"
      },
      placeholder: true
    })

    copyTextToClipboard(getOtp(secret))

    input.addEventListener("input", (e) => {
      const { value } = e.target as HTMLInputElement
      if (!value) return
      const code = getOtp(secret)
      if (value !== code) return
      onElementAppear(
        'ul[data-target="two-factor-setup-recovery-codes.codes"]',
        (ul) => {
          renderRecoveryCodeSaveTip(parsedData)
        }
      )
    })
  }
}

const renderRecoveryCodeSaveTip = async (parsedData: {
  type: string
  issuer: string
  secret: string
  account: string
}) => {
  const recoveryContainer = document.querySelector(
    'ul[data-target="two-factor-setup-recovery-codes.codes"]'
  )
  await sleep(1000)
  const liTags: HTMLLIElement[] = Array.from(
    recoveryContainer.querySelectorAll("li.two-factor-recovery-code")
  )

  const codes = liTags.map((p) => p.innerText).filter((p) => p.length > 0)
  if (codes.length === 0) return

  displayRecoveryCodeSaveMessage(recoveryContainer, {
    ...parsedData,
    id: Date.now().toString(),
    recoveryCodes: codes
  })
}

init()

export {}

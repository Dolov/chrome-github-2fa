import type { PlasmoCSConfig } from "plasmo"

import {
  copyTextToClipboard,
  displayRecoveryCodeSaveMessage,
  getOtp,
  parseOtpauthUrl,
  save2faToStorage,
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

const onElementAppear = (selector: string, callback: (el: Element) => void) => {
  // 首先检查页面是否已经存在该元素
  const existing = document.querySelector(selector)
  if (existing) {
    callback(existing)
    return
  }

  // 设置观察器来监听后续 DOM 的变化
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue

        // 检查当前节点或其子节点是否包含目标元素
        const target = node.matches?.(selector)
          ? node
          : node.querySelector?.(selector)

        if (target) {
          observer.disconnect()
          callback(target)
          return
        }
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

init()

export {}

import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import { extractDynamicPartFromURL, startOtpMessageUpdater } from "~utils"
import { Issuers, StorageKey, type DataProps } from "~utils/constant"

export const config: PlasmoCSConfig = {
  matches: ["https://www.npmjs.com/settings/*/tfa/list"],
  all_frames: false
}

const init = async () => {
  const input = document.querySelector(
    "input[id='login_otp']"
  ) as HTMLInputElement
  if (!input) return

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

const get2faListFromStorage = async (
  issuer: string,
  account: string
): Promise<DataProps[]> => {
  const storage = new Storage()
  const data = (await storage.get(StorageKey.DATA)) || []
  if (!Array.isArray(data)) return []
  return data.filter(
    (item) =>
      item.account === account &&
      item.issuer?.toLowerCase?.() === issuer?.toLowerCase?.()
  )
}

init()

export {}

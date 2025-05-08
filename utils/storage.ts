import { Storage } from "@plasmohq/storage"

import type { DataProps } from "./constant"
import { StorageKey } from "./constant"

const storage = new Storage()

export const saveOTP = async (otpData: DataProps) => {
  if (
    !otpData.id ||
    !otpData.type ||
    !otpData.secret ||
    !otpData.issuer ||
    !otpData.account
  ) {
    throw new Error("otpData is invalid")
  }
  const existingData = (await storage.get<DataProps[]>(StorageKey.DATA)) || []

  // Check if an entry with the same issuer and account exists
  const existingIndex = existingData.findIndex(
    (item) =>
      item.type === otpData.type &&
      item.issuer === otpData.issuer &&
      item.secret === otpData.secret &&
      item.account === otpData.account
  )

  if (existingIndex !== -1) {
    // Update existing entry
    existingData[existingIndex] = {
      ...existingData[existingIndex],
      ...otpData
    }
  } else {
    // Add new entry
    existingData.push(otpData)
  }

  await storage.set(StorageKey.DATA, existingData)
  return existingData
}

export const getOTPList = async (
  issuer: string,
  account: string
): Promise<DataProps[]> => {
  const data = await storage.get<DataProps[]>(StorageKey.DATA)
  if (!data) return []

  return data.filter(
    (item) =>
      item.account === account &&
      item.issuer.toLowerCase() === issuer.toLowerCase()
  )
}

export const isRecoveryCodesSaved = async (
  parsedData: DataProps
): Promise<boolean> => {
  const storedData = (await storage.get<DataProps[]>(StorageKey.DATA)) || []
  const { account, issuer, secret, recoveryCodes } = parsedData

  const matchedAccount = storedData.find(
    (item) =>
      item.issuer === issuer &&
      item.secret === secret &&
      item.account === account
  )

  if (!matchedAccount?.recoveryCodes?.length || !recoveryCodes?.length) {
    return false
  }

  const formatCodes = (codes: { value: string }[]) =>
    codes.map(({ value }) => value).join(",")

  return (
    formatCodes(matchedAccount.recoveryCodes) === formatCodes(recoveryCodes)
  )
}

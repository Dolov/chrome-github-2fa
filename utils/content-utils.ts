// 判断二维码中解析出的数据是否符合 otpauth 格式
export const isOtpauthUrl = (data: string) => {
  if (!data) return false
  return data.startsWith("otpauth://")
}

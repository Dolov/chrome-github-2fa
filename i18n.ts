
const store = {
  "en": {
    "recoveryCodes": "Recovery Codes",
    "nodata": "No Data",
    "noRecoveryCodes": "Recovery codes have not been saved to github-2fa yet, please save the data in a timely manner to avoid forgetting.",
    "recoveryCodesLessTip": "Recovery codes only {param0} left, please generate it promptly."
  },
  "cn": {
    "recoveryCodes": "重置码",
    "nodata": "暂无数据",
    "noRecoveryCodes": "尚未保存 Recovery codes 至 github-2fa, 及时保存数据，避免遗忘。",
    "recoveryCodesLessTip": "重置码仅余 {param0} 个，请及时生成。"
  }
}

const lang = navigator.language.toLowerCase()
const cn = lang.includes('zh') || lang.includes('cn')
const type = cn ? 'cn': 'en'


const i18n = (key: keyof typeof store["cn"], ...params) => {
  const text = store[type][key]
  if (!text) return ""

  if (params.length > 0) {
    return text.replace(/\{([^}]+)\}/g, (...args) => {
      const match = /param(\d+)/.exec(args[1]);
      if (!match) return params[0]
      const index = match[1]
      return params[index]
    });
  }

  return text;
}

export default i18n

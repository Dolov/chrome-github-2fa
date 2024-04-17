
const i18n = {
  "en": {
    "nodata": "No Data",
    "noRecoveryCodes": "Recovery codes have not been saved to github-2fa yet, please save the data in a timely manner to avoid forgetting."
  },
  "cn": {
    "nodata": "暂无数据",
    "noRecoveryCodes": "尚未保存 Recovery codes 至 github-2fa, 及时保存数据，避免遗忘。"
  }
}

const lang = navigator.language.toLowerCase()
const cn = lang.includes('zh') || lang.includes('cn')
const type = cn ? 'cn': 'en'

export default i18n[type]

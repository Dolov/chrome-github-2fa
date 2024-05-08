
const store = {
  "en": {
    "recoveryCodes": "Recovery Codes",
    "nodata": "No Data",
    "noRecoveryCodes": "Recovery codes have not been saved to github-2fa yet, please save the data in a timely manner to avoid forgetting.",
    "recoveryCodesLessTip": "Recovery codes only {param0} left, please generate it promptly.",
    "startTip": "Start managing your Github 2FA Code.",
    "goToGen": "Go to generate",
    "noSectet": "Secret has not been generated yet.",
    "savedSuccessfully": "Saved successfully.",
    "createGmailDraft": "Create Gmail draft storage data",
    "withGoogle": "Continue with Google",
    "declare": "All data is stored locally on the browser, no intermediate service, please use it with relax.",
    "saveToGmailDeclare": "If you are concerned about data loss, you can log in with Google authorization and store the data in your Gmail email draft."
  },
  "cn": {
    "recoveryCodes": "重置码",
    "nodata": "暂无数据",
    "noRecoveryCodes": "尚未保存 Recovery codes 至 github-2fa, 及时保存数据，避免遗忘。",
    "recoveryCodesLessTip": "重置码仅余 {param0} 个，请及时生成。",
    "startTip": "开始管理你的 Github 2FA Code。",
    "goToGen": "前往生成",
    "noSectet": "尚未生成 secret，",
    "savedSuccessfully": "保存成功。",
    "createGmailDraft": "创建 Gmail 草稿存储数据",
    "withGoogle": "使用 Google 进行登录",
    "declare": "郑重声明：所有数据都在浏览器本地，不会收集存储用户数据，且无中间服务，可放心使用！",
    "saveToGmailDeclare": "如若担心数据遗失，可进行 Google 授权登录，存储数据至 Gmail 邮箱草稿中。"
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

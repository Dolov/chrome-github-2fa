import type { PlasmoCSConfig } from "plasmo"
import { dataSource, type DataProps } from '../util'

export const config: PlasmoCSConfig = {
  matches: [
    // 从这个路径进入 recovery 页面不会触发插入 js 操作，所以把这个也匹配上
    "https://github.com/sessions/two-factor/app",
    // 刷新进入
    "https://github.com/sessions/two-factor/recovery",
  ],
  all_frames: true
}

class Authenticator {
  data: Record<string, DataProps>
  input: HTMLInputElement
  submitButton: HTMLButtonElement
  constructor() {
    this.input = document.querySelector('#recovery_code')
    if (this.input) {
      this.init()
      return
    }
    const link = document.querySelector('a[data-test-selector=recovery-code-link]')
    link.addEventListener('click', e => {
      const timer = setInterval(() => {
        this.input = document.querySelector('#recovery_code')
        if (!this.input) return
        window.clearInterval(timer)
        this.init()
      }, 2000)
    })
  }

  async init() {
    this.data = await dataSource.get()
    if (!this.data) return
    this.submitButton = document.querySelector('button[type=submit]')
    this.renderRecoveryCodes()
    this.addSubmitListener()
  }

  renderRecoveryCodes() {
    const data = this.data
    const types = Object.keys(data)
    types.forEach(type => {
      const { account, recoveryCodes = [] } = data[type]
      if (!recoveryCodes.length) return
      const div = document.createElement('div')
      div.style.marginTop = "8px"
      const one = types.length === 1
      const prefix = one ? "" : `<h4>${account}</h4>`
      div.innerHTML = prefix + recoveryCodes.reduce((html, item) => {
        const { copyed, value } = item
        if (copyed) return html
        html += `
          <div data-value=${value} style="
            box-sizing: border-box;
            border-radius: 9999px;
            background-color: #0095ee26;
            color: #004b83;
            position: relative;
            -webkit-user-select: none;
            user-select: none;
            overflow: hidden;
            white-space: nowrap;
            vertical-align: bottom;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            padding: 2px 2px;
            width: 125px;
            margin-top: 5px;
            cursor: pointer;
          ">
            ${value}
          </div>`
        return html
      }, "")
      div.addEventListener('click', e => {
        const value = (e.target as HTMLDivElement).dataset.value
        if (!value) return
        this.input.value = value
      })
      this.input.parentNode.insertBefore(div, this.submitButton)
    })
  }

  addSubmitListener() {
    this.submitButton.addEventListener('click', e => {
      const value = this.input.value
      if (!value) return
      const types = Object.keys(this.data)
      types.forEach(type => {
        const codes = this.data[type].recoveryCodes || []
        const code = codes.find(item => item.value === value)
        code.copyed = true
      })
      dataSource.save(this.data)
    })
  }
}

const auth = new Authenticator()

export { }
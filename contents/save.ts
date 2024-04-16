
import type { PlasmoCSConfig } from "plasmo"
import jsQR from 'jsqr'
import { dataSource, type TFAProps, authenticator } from '../util'


export const config: PlasmoCSConfig = {
	matches: [
    "https://github.com/settings/auth/recovery-codes",
    "https://github.com/settings/auth/recovery-codes?",
  ],
	all_frames: true
}

class Authenticator {

	constructor() {
		this.init()
	}

	async init() {
		this.renderButton()
	}

  renderButton() {
    const container: HTMLDivElement = document.querySelector('.recovery-codes-saving-options')
    if (!container) return
    container.style.marginLeft = "0px"
    const button = document.createElement("span")
    button.setAttribute('class', "btn")
    button.innerText = "github-2fa"
    button.title = "Save recovery codes to github-2fa."
    button.addEventListener('click', () => {
      const items = document.querySelectorAll('.two-factor-recovery-code')
      const data = ([...items] as HTMLLIElement[]).map(item => item.innerText)
    })
    container.appendChild(button)
  }
}

const auth = new Authenticator()



export { }
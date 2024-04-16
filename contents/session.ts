
import type { PlasmoCSConfig } from "plasmo"
import { dataSource, type TFAProps, authenticator } from '../util'


export const config: PlasmoCSConfig = {
	matches: [
		"https://github.com/sessions/two-factor",
		"https://github.com/sessions/two-factor/app",
	],
	all_frames: true
}

class Authenticator {

	constructor() {
		this.init()
	}

	async init() {
		const data = await dataSource.get()
		this.renderDataSource(data)
	}

	renderDataSource(data: Record<string, TFAProps>) {
		const input: HTMLInputElement = document.querySelector('#app_totp')
		const verifyButton = document.querySelector('.btn-primary')
		if (!input) return
		if (!verifyButton) return
		const keys = Object.keys(data)
		if (keys.length > 1) {
			input.placeholder = "Select account and click."
		}
		keys.forEach(key => {
			const params = data[key]
			const { secret, account } = params
			const button = document.createElement('span')
			button.style.width = "100%"
			const token = authenticator.generate(secret)
			button.innerHTML = `${account} ${token}`
			verifyButton.parentNode.insertBefore(button, verifyButton)
			this.refreshToken(button, token, params)
			button.setAttribute('class', 'btn')
			button.setAttribute('token', token)
			button.addEventListener('click', () => {
				const token = button.getAttribute('token')
				input.value = token
			})
			if (keys.length === 1) {
				input.value = token
			}
		})
	}

	refreshToken(button, token, params) {
		const { account, secret } = params
    const timer = setInterval(() => {
      const timeRemaining = authenticator.timeRemaining()
			button.innerHTML = `${account} ${token} (${timeRemaining}s)`
      if (timeRemaining === 1) {
        clearInterval(timer)
				const token = authenticator.generate(secret)
				button.setAttribute('token', token)
				this.refreshToken(button, token, params)
      }
    }, 1000)
  }
}

const auth = new Authenticator()

export { }

import type { PlasmoCSConfig } from "plasmo"
import { dataSource, type DataProps, authenticator } from '../util'


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
		this.renderAccountButton(data)
	}

	renderAccountButton(data: Record<string, DataProps>) {
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
			const button = document.createElement('span')
			button.style.width = "100%"
			button.setAttribute('class', 'btn')
			
			verifyButton.parentNode.insertBefore(button, verifyButton)
			this.refresh2FACode(button, params)
			button.addEventListener('click', () => {
				const token = button.getAttribute('token')
				input.value = token
			})
			if (keys.length === 1) {
				const token = button.getAttribute('token')
				input.value = token
			}
		})
	}

	render2FACode(button: HTMLButtonElement, params) {
		const { account, secret } = params
		const token = authenticator.generate(secret)
		const timeRemaining = authenticator.timeRemaining()
		button.setAttribute('token', token)
		button.innerHTML = `${account} ${token} (${timeRemaining}s)`
	}

	refresh2FACode(button, params) {
		this.render2FACode(button, params)
		setInterval(() => {
			this.render2FACode(button, params)
		}, 1000)
	}
}

const auth = new Authenticator()

export { }
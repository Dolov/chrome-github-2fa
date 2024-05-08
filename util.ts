
import { Storage } from "@plasmohq/storage"
import { authenticator } from 'otplib'

export const SECURITY_URL = "https://github.com/settings/security?type=app#two-factor-summary"

export const gmailIconUrl = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 48 48'%3E%3Cdefs%3E%3Cpath id='a' d='M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z'/%3E%3C/defs%3E%3CclipPath id='b'%3E%3Cuse xlink:href='%23a' overflow='visible'/%3E%3C/clipPath%3E%3Cpath clip-path='url(%23b)' fill='%23FBBC05' d='M0 37V11l17 13z'/%3E%3Cpath clip-path='url(%23b)' fill='%23EA4335' d='M0 11l17 13 7-6.1L48 14V0H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%2334A853' d='M0 37l30-23 7.9 1L48 0v48H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%234285F4' d='M48 48L17 24l-4-3 35-10z'/%3E%3C/svg%3E`

export const authenticatorOptions = {
	step: 30,
	digits: 6,
}

// 配置身份验证器
authenticator.options = authenticatorOptions

export {
	authenticator
}

export const storage = new Storage()

export interface DataProps {
	type?: string,
	issuer?: string,
	secret?: string,
	account: string,
	recoveryCodes?: { value: string, copyed: boolean }[]
}

class DataSource {
	storageKey: string
	constructor(key: string) {
		this.storageKey = key
	}

	async set(account: DataProps["account"], params: DataProps) {
		const store = await storage.get(this.storageKey) || {}
		store[account] = {
			...store[account],
			...params,
		}
		return await storage.set(this.storageKey, store)
	}

	async get(): Promise<Record<string, DataProps>> {
		return await storage.get(this.storageKey) || {}
	}

	async setRecoveryCodes(account, codes) {
		const store = await this.get()
		store[account] = {
			...store[account],
			account,
			recoveryCodes: codes
		}
		return await this.set(account, store[account])
	}

	async save(data) {
		return await storage.set(this.storageKey, data)
	}
}

export const dataSource = new DataSource("DATA_SOURCE")


/**
 * Copies the given text to the clipboard.
 *
 * @param {string} text - The text to be copied.
 * @return {void} This function does not return anything.
 */
export const copyTextToClipboard = (text: string) => {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();

	try {
		const successful = document.execCommand('copy');
	} catch (err) {
		console.log('err: ', err);
	}
	document.body.removeChild(textArea);
}

/**
 * Synchronizes the client's time with Google's server time by making a request to Google's server and calculating the time offset.
 *
 * @return {Promise<{offset: number, clientTime: number, serverTime: number}>} An object containing the time offset in seconds, the client's time in milliseconds, and the server's time in milliseconds.
 */
export const syncTimeWithGoogle = async () => {
	const res = await fetch('https://www.google.com/generate_204')
	const serverDate = res.headers.get('date')
	const serverTime = new Date(serverDate).getTime();
	const clientTime = new Date().getTime();
	const offset = Math.round((serverTime - clientTime) / 1000);

	return {
		offset,
		clientTime,
		serverTime,
	}
}

/**
 * Creates a Gmail draft message with the given subject and content.
 *
 * @param {string} token - The access token for authorization.
 * @param {Object} options - The options for creating the draft message.
 * @param {string} options.subject - The subject of the draft message.
 * @param {string} options.content - The content of the draft message.
 * @return {Promise<Object>} A promise that resolves to the response JSON of the API call.
 */
export const createGmailDraftMessage = (token: string, {
	subject,
	content,
}) => {
	const message = {
		message: {
			raw: btoa(unescape(encodeURIComponent(`Subject: ${subject}\r\n\r\n${content}`)))
			// DOMException: Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.
			// raw: btoa(
			// 	`Subject: ${subject}\r\n\r\n${content}`
			// )
		}
	};

	return fetch(`https://gmail.googleapis.com/gmail/v1/users/me/drafts`, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(message)
	}).then(response => response.json())
}
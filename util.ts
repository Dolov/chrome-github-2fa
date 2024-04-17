
import { Storage } from "@plasmohq/storage"
import { authenticator } from 'otplib'


export const authenticatorOptions = {
	step: 30,
	digits: 6,
}

// 配置身份验证器
authenticator.options = authenticatorOptions

export {
	authenticator
}

const DATA_SOURCE = "DATA_SOURCE"

export const storage = new Storage()

export interface DataProps {
	type: string,
	issuer: string,
	secret: string,
	account: string,
	recoveryCodes?: { value: string, copyed: boolean }[]
}

class DataSource {
	storageKey: string
	constructor(key: string) {
		this.storageKey = key
	}

	async set(type: DataProps["type"], params: DataProps) {
		const data = await storage.get(this.storageKey) || {}
		data[type] = params
		await storage.set(this.storageKey, data)
		return data
	}

	async get(): Promise<Record<string, DataProps>> {
		const data: Record<string, DataProps> = await storage.get(this.storageKey) || {}
		return data
	}

	async setRecoveryCodes(account, codes) {
		const data = await this.get()
		const type = Object.keys(data).find(type => data[type].account === account)
		data[type] = {
			...data[type],
			recoveryCodes: codes
		}
	  return await this.set(type, data[type])
	}

	async save(data) {
		return await storage.set(this.storageKey, data)
	}
}

export const dataSource = new DataSource(DATA_SOURCE)


export const copyTextToClipboard = (text: string) => {
	// 创建一个文本输入框元素
	const textArea = document.createElement("textarea");

	// 设置文本框的值为要复制的文本
	textArea.value = text;

	// 将文本框添加到文档中
	document.body.appendChild(textArea);

	// 选中文本框中的文本
	textArea.select();

	try {
		// 尝试执行复制操作
		const successful = document.execCommand('copy');
		const msg = successful ? '已复制到剪贴板' : '复制失败';
		console.log(msg);
	} catch (err) {
		console.error('无法复制文本', err);
	}
	// 移除文本框元素
	document.body.removeChild(textArea);
}

/** 同步谷歌时间 */
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
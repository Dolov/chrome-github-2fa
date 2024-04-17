
import { Storage } from "@plasmohq/storage"
import { authenticator } from 'otplib'


// 配置身份验证器
authenticator.options = {
  step: 30,
  digits: 6,
};

export {
	authenticator
}

const DATA_SOURCE = "DATA_SOURCE"
const RECOVERY_CODE = "RECOVERY_CODE"

export const storage = new Storage()

export interface TFAProps {
	type: string,
	issuer: string,
	secret: string,
	account: string,
}

class DataSource<T> {
	storageKey: string
	constructor(key: string) {
		this.storageKey = key
	}

	async set(key, params) {
		const data = await storage.get(this.storageKey) || {}
		data[key] = params
		await storage.set(this.storageKey, data)
		return data
	}

	async get(): Promise<Record<string, T>> {
		const data: Record<string, T> = await storage.get(this.storageKey) || {}
		return data
	}
}

export const dataSource = new DataSource<TFAProps>(DATA_SOURCE)
export const recoveryCodeDataSource = new DataSource<{ value: string, copyed: boolean }[]>(RECOVERY_CODE)


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

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

export const storage = new Storage()

export interface TFAProps {
	type: string,
	issuer: string,
	secret: string,
	account: string,
}

class DataSource {

	constructor() {
		
	}

	async set(key, params) {
		const data = await storage.get(DATA_SOURCE) || {}
		data[key] = params
		await storage.set("DATA_SOURCE", data)
		return data
	}

	async get(): Promise<Record<string, TFAProps>> {
		const data: Record<string, TFAProps> = await storage.get(DATA_SOURCE) || {}
		return data
	}
}

export const dataSource = new DataSource()


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

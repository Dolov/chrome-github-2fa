
import type { PlasmoCSConfig } from "plasmo"
import jsQR from 'jsqr'
import { dataSource, authenticator, copyTextToClipboard } from '../util'

export const config: PlasmoCSConfig = {
  matches: [
    // "https://github.com/settings/auth/recovery-codes?",
    "https://github.com/settings/security?type=app",
    "https://github.com/settings/two_factor_authentication/setup/intro",
  ],
  all_frames: true
}


class Authenticator {

  static parseOTPAuthURL(url: string) {
    const parsedURL = new URL(url);

    const params = parsedURL.searchParams;
    const secret = params.get('secret'); // 获取密钥
    const issuer = params.get('issuer'); // 获取发行者
    const type = parsedURL.pathname.substring(1); // 获取路径名并去掉开头的斜杠
    const account = parsedURL.pathname.split(':')[1]; // 获取用户名

    return {
      type: type,
      issuer: issuer,
      secret: secret,
      account: account,
    };
  }

  params: ReturnType<typeof Authenticator.parseOTPAuthURL>
  tFAInput: HTMLInputElement
  saveButton: HTMLButtonElement
  qrcodeImage: HTMLImageElement

  constructor() {
    this.tFAInput = document.querySelector('input[name=otp]')
    if (!this.tFAInput) return
    this.saveButton = document.querySelector('button[data-target*=two-factor-configure-otp-factor]')
    this.init()
    if (this.saveButton) {
      this.addSaveEventListener()
    } else {
      this.addRecoveryCodesListener()
    }
  }

  addRecoveryCodesListener() {
    const targetElement = document.querySelector("ul[data-target*=two-factor-setup-recovery-codes]");
    if (!targetElement) return
    if (!location.href.includes("https://github.com/settings/two_factor_authentication/setup/intro")) return
    let saveable = false
    const observer = new MutationObserver((mutationsList, observer) => {
      // 遍历所有发生的变动
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          saveable = true
        }
      }
      if (saveable) {
        observer.disconnect()
        const lis = targetElement.querySelectorAll('li')
        const recoveryCodes = [...lis].map(item => {
          return {
            value: item.innerText,
            copyed: false
          }
        })
        const { type } = this.params
        dataSource.set(type, {
          ...this.params,
          recoveryCodes,
        })
      }
    });
    observer.observe(targetElement, { childList: true, subtree: true });
  }

  addSaveEventListener() {
    if (!location.href.includes('https://github.com/settings/security?type=app')) return
    this.saveButton.addEventListener('click', () => {
      const { type } = this.params
      dataSource.set(type, this.params)
    })
  }

  async init() {
    const url = await this.getQRcodeValue()
    if (!url) return
    this.params = Authenticator.parseOTPAuthURL(url)
    const { type } = this.params
    const store = await dataSource.get()
    // 不存在则立即保存到插件，如果存在则需要区别是否使用了
    if (!store[type]) {
      dataSource.set(type, this.params)
    }
    const button = this.render2FAButton()
    this.refresh2FACode(button, this.params)
  }

  /** 获取页面二维码像素数据 */
  async getQRcodePixelData(): Promise<Uint8ClampedArray> {
    const qrcodeImage = document.querySelector('.qr-code-img') as unknown as HTMLImageElement
    if (!qrcodeImage) return
    this.qrcodeImage = qrcodeImage
    return new Promise(resolve => {
      const resolveData = () => {
        const { width, height } = this.qrcodeImage
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 设置 Canvas 尺寸与图片尺寸相同
        canvas.width = width
        canvas.height = height

        // 在 Canvas 上绘制图片
        context.drawImage(this.qrcodeImage, 0, 0);
        // 获取像素数据
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // 将像素数据转换为 Uint8ClampedArray
        resolve(imageData.data)
      }

      // 图片已经加载完毕
      if (this.qrcodeImage.width) {
        resolveData()
        return
      }
      // 图片尚未加载完毕
      this.qrcodeImage.onload = () => {
        resolveData()
      }
    })
  }

  /** 根据像素数据解析出二维码内容 */
  async getQRcodeValue() {
    const pixelData = await this.getQRcodePixelData()
    if (!pixelData) return
    const { width, height } = this.qrcodeImage
    const res = jsQR(pixelData, width, height)
    if (!res) return
    return res.data
  }

  autoFocus() {
    if (
      location.href.includes("github.com/settings/security?type=app#two-factor-summary") ||
      location.href.includes("github.com/settings/two_factor_authentication/setup/intro")
    ) {
      this.tFAInput.focus()
    }
  }

  render2FAButton() {
    const button = document.createElement('span')
    button.title = "chrome plugin github-2fa"
    button.setAttribute('class', 'btn')
    button.style.marginLeft = '16px'
    this.tFAInput.parentNode.appendChild(button)
    button.addEventListener('click', e => {
      const token = button.getAttribute('token')
      copyTextToClipboard(token)
      this.tFAInput.focus()
    })
    return button
  }

  render2FACode(button, params) {
    const { secret } = params
    const token = authenticator.generate(secret)
    const timeRemaining = authenticator.timeRemaining()
    button.innerText = `${token} (${timeRemaining}s)`
    button.setAttribute('token', token)
    this.tFAInput.placeholder = `Input ${token}`
  }

  refresh2FACode(button, params) {
    this.render2FACode(button, params)
    setInterval(() => {
      this.render2FACode(button, params)
    }, 1000)
  }
}

const auth = new Authenticator()

export { Authenticator }

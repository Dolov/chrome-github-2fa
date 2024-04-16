
import type { PlasmoCSConfig } from "plasmo"
import jsQR from 'jsqr'
import { dataSource, authenticator, copyTextToClipboard } from '../util'

export const config: PlasmoCSConfig = {
  matches: [
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
  button: HTMLSpanElement
  codeInput: HTMLInputElement
  qrcodeImage: HTMLImageElement

  constructor() {
    this.init()
  }

  async init() {
    const url = await this.getQRcodeValue()
    console.log('url: ', url);
    if (!url) return
    this.params = Authenticator.parseOTPAuthURL(url)
    const { secret, type } = this.params
    const token = authenticator.generate(secret)
    if (!token) return
    dataSource.set(type, this.params)
    this.renderButton(token)
    this.refreshToken(token)
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

  /** 在页面插入按钮，展示对应的 2fa 码 */
  renderButton(token) {
    const input: HTMLInputElement = document.querySelector('input[name=otp]')
    if (!input) return
    this.codeInput = input
    this.button = document.createElement('span')
    this.button.title = "chrome plugin github-2fa"
    this.button.setAttribute('class', 'btn')
    this.button.style.marginLeft = '16px'
    this.button.innerText = token
    input.parentNode.appendChild(this.button)
    if (
      location.href.includes("github.com/settings/security?type=app#two-factor-summary") ||
      location.href.includes("github.com/settings/two_factor_authentication/setup/intro")
    ) {
      input.focus()
      this.setPlaceholder(`Input ${token}`)
    }
    this.button.addEventListener('click', e => {
      copyTextToClipboard(token)
      this.setPlaceholder(`Input or Paste ${token}`)
      input.focus()
    })
  }

  setPlaceholder(placeholder) {
    this.codeInput.placeholder = placeholder
  }

  refreshToken(token) {
    const timer = setInterval(() => {
      const timeRemaining = authenticator.timeRemaining()
      this.button.innerText = `${token} (${timeRemaining}s)`
      if (timeRemaining === 1) {
        clearInterval(timer)
        const token = authenticator.generate(this.params.secret)
        this.refreshToken(token)
        this.setPlaceholder(`Input ${token}`)
      }
    }, 1000)
  }
}

const auth = new Authenticator()


export { Authenticator }

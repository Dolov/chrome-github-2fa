import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"]
}

class Stats {
  userName: string
  constructor() {
    const isEnable = this.enable()
    if (!isEnable) return
    const isHomePage = this.homePage()
    if (!isHomePage) return
    this.init()
  }

  enable() {
    const statsEnable = localStorage.getItem("statsEnable")
    return statsEnable === "true"
  }

  homePage = () => {
    // const meta = document.querySelector('meta[name="octolytics-actor-login"]')
    const meta = document.querySelector('meta[property="profile:username"]')
    if (!meta) return
    const userName = meta.getAttribute("content")
    if (!userName) return false
    this.userName = userName
    const isUserHomePage = location.href === `https://github.com/${userName}`
    return isUserHomePage
  }

  init() {
    const container = document.querySelector(".js-profile-editable-replace")
    if (!container) return
    const image = document.createElement("img")
    image.src = `https://github-readme-stats.vercel.app/api?username=${this.userName}&theme=radical`
    image.style.width = "100%"
    image.style.borderRadius = "8px"
    if (container.children.length >= 1) {
      container.insertBefore(image, container.children[0])
    } else {
      container.appendChild(image)
    }
  }
}

const stats = new Stats()

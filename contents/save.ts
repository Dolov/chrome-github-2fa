import type { PlasmoCSConfig } from "plasmo"

import { dataSource } from "../util"

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/settings/auth/recovery-codes",
    "https://github.com/settings/auth/recovery-codes?"
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
    const container: HTMLDivElement = document.querySelector(
      ".recovery-codes-saving-options"
    )
    if (!container) return
    container.style.marginLeft = "0px"
    const button = document.createElement("span")
    button.setAttribute("class", "btn")
    button.innerText = "github-2fa"
    button.title = "Save recovery codes in github-2fa"
    button.addEventListener("click", () => {
      const items = document.querySelectorAll(".two-factor-recovery-code")
      console.log("items: ", items)
      const data = ([...items] as HTMLLIElement[])
        .map((item) => item.innerText)
        .map((item) => {
          return {
            value: item
          }
        })
      const userNameElement: HTMLSpanElement =
        document.querySelector(".Truncate-text")
      if (!userNameElement) return
      const username = userNameElement.innerText.trim()
      dataSource.setRecoveryCodes(username, data)

      const oColor = button.style.color
      button.style.color = "green"
      setTimeout(() => {
        button.style.color = oColor
      }, 1000)
    })
    container.appendChild(button)
  }
}

const auth = new Authenticator()

export {}

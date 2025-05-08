import clsx from "clsx"
import { Menu, Search } from "lucide-react"
import React from "react"

import { GlobalContext } from "./context"

interface HeaderProps {}

const Header: React.FC<HeaderProps> = (props) => {
  const { containerType } = React.useContext(GlobalContext)

  const goSettings = () => {
    chrome.tabs.create({
      url: "tabs/settings.html"
    })
  }

  return (
    <div
      className={clsx("h-16 flex justify-between items-center px-4", {
        "mt-4": containerType === "phone"
      })}>
      <button onClick={goSettings} className="btn btn-ghost btn-sm btn-circle">
        <Menu />
      </button>
      <div className="text-2xl font-bold">Github 2FA</div>
      <button className="btn btn-ghost btn-sm btn-circle">
        <Search />
      </button>
    </div>
  )
}

export default Header

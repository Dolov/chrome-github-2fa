import { Menu, Search } from "lucide-react"
import React from "react"

const Header = () => {
  const goSettings = () => {
    chrome.tabs.create({
      url: "tabs/settings.html"
    })
  }

  return (
    <div className="h-16 flex justify-between items-center px-4">
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

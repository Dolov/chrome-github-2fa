import { Menu, Search } from "lucide-react"
import React from "react"

const Header = () => {
  return (
    <div className="h-16 flex justify-between items-center">
      <button className="btn btn-ghost btn-sm btn-circle">
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

import clsx from "clsx"
import { Menu, Search } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, type DataProps } from "~utils"

import { GlobalContext } from "./context"

interface HeaderProps {}

const Header: React.FC<HeaderProps> = (props) => {
  const { containerType, filter, setFilter } = React.useContext(GlobalContext)
  const [data = []] = useStorage<DataProps[]>(StorageKey.DATA)
  const goSettings = () => {
    chrome.tabs.create({
      url: "tabs/settings.html"
    })
  }

  const deletedCount = data.filter((item) => item.deleted).length
  const normalCount = data.filter((item) => !item.deleted).length

  return (
    <div
      className={clsx("h-16 flex justify-between items-center px-4", {
        "mt-4": containerType === "phone"
      })}>
      <div className="dropdown dropdown-hover">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-sm btn-circle">
          <Menu />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <a onClick={goSettings}>设置</a>
          </li>
          {filter === "deleted" && (
            <li>
              <a onClick={() => setFilter("normal")}>
                全部
                <div className="badge badge-secondary">{normalCount}</div>
              </a>
            </li>
          )}
          {deletedCount > 0 && filter === "normal" && (
            <li>
              <a onClick={() => setFilter("deleted")}>
                已删除
                <div className="badge badge-secondary">{deletedCount}</div>
              </a>
            </li>
          )}
        </ul>
      </div>
      <div className="text-2xl font-bold">Github 2FA</div>
      <button className="btn btn-ghost btn-sm btn-circle">
        <Search />
      </button>
    </div>
  )
}

export default Header

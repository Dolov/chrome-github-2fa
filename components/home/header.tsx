import clsx from "clsx"
import { Menu, Search, Trash } from "lucide-react"
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
  const deletedFilter = filter === "deleted"

  return (
    <div
      className={clsx("h-16 grid grid-cols-[1fr_2fr_1fr] items-center px-4", {
        "mt-4": containerType === "phone"
      })}>
      <div className="dropdown dropdown-hover">
        {!deletedFilter && (
          <div
            role="button"
            tabIndex={0}
            className="btn btn-ghost btn-sm btn-circle">
            <Menu />
          </div>
        )}
        {deletedFilter && (
          <button role="button" tabIndex={0} className="btn btn-sm relative">
            <Trash size={18} className="text-error" />
            <div className="badge badge-secondary absolute -right-4 -top-3">
              {deletedCount}
            </div>
          </button>
        )}
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
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
          <li>
            <a onClick={goSettings}>设置</a>
          </li>
        </ul>
      </div>
      <div className="text-2xl font-bold text-center whitespace-nowrap">
        Github 2FA
      </div>
      <div className="flex justify-end">
        <button className="btn btn-ghost btn-sm btn-circle">
          <Search />
        </button>
      </div>
    </div>
  )
}

export default Header

import clsx from "clsx"
import { Menu, Search, Trash } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Dropdown from "~components/ui/dropdown"
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

  const menuItems = React.useMemo(() => {
    const items = []

    if (filter === "deleted") {
      items.push({
        key: "all",
        label: (
          <div>
            全部
            <div className="badge badge-primary ml-2">{normalCount}</div>
          </div>
        ),
        onClick: () => setFilter("normal")
      })
    }

    if (filter === "normal" && deletedCount > 0) {
      items.push({
        key: "deleted",
        label: (
          <div>
            已删除
            <div className="badge badge-neutral ml-2">{deletedCount}</div>
          </div>
        ),
        onClick: () => setFilter("deleted")
      })
    }

    items.push({
      key: "settings",
      label: "设置",
      onClick: goSettings
    })

    return items
  }, [filter, normalCount, deletedCount])

  return (
    <div
      className={clsx("h-16 grid grid-cols-[1fr_2fr_1fr] items-center px-4", {
        "mt-4": containerType === "phone"
      })}>
      <Dropdown trigger="hover" menus={menuItems}>
        <button
          className="btn btn-sm btn-circle btn-ghost relative"
          tabIndex={0}>
          {!deletedFilter && <Menu />}
          {deletedFilter && (
            <div>
              <Trash size={18} className="text-error" />
              <div className="badge badge-neutral absolute -right-4 -top-3">
                {deletedCount}
              </div>
            </div>
          )}
        </button>
      </Dropdown>
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

import clsx from "clsx"
import { FileCog } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { type DataProps } from "~/utils/constant"
import Favicon, { elegantImageMap, minimalIconMap } from "~components/favicons"
import Opt from "~components/opt"
import ContextMenu from "~components/ui/context-menu"
import {
  copyTextToClipboard,
  getOtp,
  getProcessColor,
  getTimeRemaining
} from "~utils"
import { DEFAULT_SETTINGS, StorageKey } from "~utils/constant"

import ItemActions from "./item-actions"

interface ListProps {}

const List: React.FC<ListProps> = (props) => {
  const [data, setData] = useStorage<DataProps[]>(StorageKey.DATA, [])

  const [item, setItem] = React.useState<DataProps>(null)

  const handleCopy = (item) => {
    copyTextToClipboard(item.opt)
    setItem(item)
  }

  React.useEffect(() => {
    if (item) {
      setTimeout(() => {
        setItem(null)
      }, 1000)
    }
  }, [item])

  return (
    <div className="flex-1 overflow-auto px-4">
      {data.map((item) => {
        const { id } = item
        return <ListItem key={id} data={item} handleCopy={handleCopy} />
      })}
      {item && (
        <div className="toast toast-center">
          <div className="alert bg-neutral text-base-100 py-2">
            <span>
              {item.issuer}-{item.account} 已复制到剪贴板
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface ListItemProps {
  data: DataProps
  handleCopy: (item: DataProps) => void
}

const ListItem: React.FC<ListItemProps> = (props) => {
  const { data, handleCopy } = props
  const { id, type, pinned, issuer, secret, account } = data
  const vendor = issuer.toLocaleLowerCase()
  const [opt, setOpt] = React.useState("")
  const [nextOpt, setNextOpt] = React.useState("")
  const [actionVisible, setActionVisible] = React.useState(false)
  const [timeRemaining, setTimeRemaining] = React.useState<number>(null)
  const timer = React.useRef(null)

  React.useEffect(() => {
    calcOTP()
    timer.current = setInterval(() => {
      calcOTP()
    }, 1000)

    return () => {
      clearInterval(timer.current)
    }
  }, [])

  const calcOTP = () => {
    const opt = getOtp(secret)
    const nextOpt = getOtp(secret, true)
    const timeRemaining = getTimeRemaining()

    setOpt(opt)
    setNextOpt(nextOpt)
    setTimeRemaining(timeRemaining)
  }

  const color = getProcessColor(timeRemaining)
  return (
    <div
      onClick={() => handleCopy(data)}
      className={clsx(
        "group relative bg-base-200 py-4 mb-4 rounded-btn overflow-hidden hover:shadow-lg",
        {
          "shadow-lg": pinned
        }
      )}>
      <progress
        max={30}
        value={timeRemaining}
        className={`progress ${color} w-full absolute top-[0px] h-[3px] bg-base-200`}
      />

      {pinned && <div className="absolute top-0 left-0 w-2 h-full bg-accent" />}
      <ItemActions
        visible={actionVisible}
        onClose={() => setActionVisible(false)}
        itemData={data}
      />
      <div className="px-4 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="base-content font-medium text-lg">{issuer}</span>
            <button
              className="btn btn-circle btn-ghost btn-sm ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => setActionVisible(true)}>
              <FileCog size={16} />
            </button>
          </div>
          <Favicon vendor={vendor} />
        </div>
        <div className="base-content font-medium -translate-y-[2px]">
          {account}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <Opt className="font-bold text-2xl text-primary">{opt}</Opt>
          <div>
            <div className="base-content text-[0.6rem] text-right">下一个</div>
            <Opt small className="text-secondary text-sm font-medium">
              {nextOpt}
            </Opt>
          </div>
        </div>
      </div>
    </div>
  )
}

export default List

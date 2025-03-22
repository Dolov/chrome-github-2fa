import clsx from "clsx"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { type DataProps } from "~/utils/constant"
import Favicon, { elegantImageMap, minimalIconMap } from "~components/favicons"
import Opt from "~components/opt"
import {
  copyTextToClipboard,
  getOtp,
  getProcessColor,
  getTimeRemaining
} from "~utils"
import { DEFAULT_SETTINGS, StorageKey } from "~utils/constant"

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
  const { id, type, issuer, secret, account } = data
  const vendor = issuer.toLocaleLowerCase()
  const [opt, setOpt] = React.useState("")
  const [nextOpt, setNextOpt] = React.useState("")
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
      className="bg-base-200 py-4 mb-4 rounded-lg relative overflow-hidden hover:shadow-lg">
      <progress
        max={30}
        value={timeRemaining}
        className={`progress ${color} w-full absolute top-[0px] h-[3px] bg-base-200`}
      />
      <div className="px-4 relative">
        <div className="flex justify-between items-center">
          <div className="font-medium text-lg">{issuer}</div>
          <Favicon vendor={vendor} />
        </div>
        <div className="text-neutral/60 font-medium -translate-y-[2px]">
          {account}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <Opt className="font-bold text-2xl text-primary">{opt}</Opt>
          <div>
            <div className="text-neutral/60 text-[0.6rem] text-right">
              下一个
            </div>
            <Opt small className="text-neutral/60 text-sm font-medium">
              {nextOpt}
            </Opt>
          </div>
        </div>
      </div>
    </div>
  )
}

export default List

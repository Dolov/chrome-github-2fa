import clsx from "clsx"
import noData from "data-base64:~assets/no-data.svg"
import { FileCog } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { type DataProps } from "~/utils/constant"
import Favicon, { elegantImageMap, minimalIconMap } from "~components/favicons"
import OtpText from "~components/otp-text"
import message from "~components/ui/message"
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

  return (
    <div className="flex-1 overflow-auto px-4">
      {data.length === 0 && (
        <img
          src={noData}
          className="mt-14 w-full transition-transform duration-700 ease-in-out animate-pulse hover:scale-105"
        />
      )}
      {data.map((item) => {
        const { id } = item
        return <ListItem key={id} data={item} />
      })}
    </div>
  )
}

interface ListItemProps {
  data: DataProps
}

const ListItem: React.FC<ListItemProps> = (props) => {
  const { data } = props
  const { id, type, pinned, issuer, secret, account } = data
  const vendor = issuer.toLocaleLowerCase()
  const [otp, setOtp] = React.useState("")
  const [nextOtp, setNextOtp] = React.useState("")
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
    const otp = getOtp(secret)
    const nextOtp = getOtp(secret, true)
    const timeRemaining = getTimeRemaining()

    setOtp(otp)
    setNextOtp(nextOtp)
    setTimeRemaining(timeRemaining)
  }

  const handleCopy = () => {
    copyTextToClipboard(otp)
    message.success(`复制成功`)
  }

  const color = getProcessColor(timeRemaining)
  return (
    <div
      onClick={handleCopy}
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
              onClick={(e) => {
                e.stopPropagation()
                setActionVisible(true)
              }}>
              <FileCog size={16} />
            </button>
          </div>
          <Favicon vendor={vendor} />
        </div>
        <div className="base-content font-medium -translate-y-[2px]">
          {account}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <OtpText className="font-bold text-2xl text-primary">{otp}</OtpText>
          <div>
            <div className="base-content text-[0.6rem] text-right">下一个</div>
            <OtpText small className="text-secondary text-sm font-medium">
              {nextOtp}
            </OtpText>
          </div>
        </div>
      </div>
    </div>
  )
}

export default List

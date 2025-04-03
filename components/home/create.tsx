import clsx from "clsx"
import { Keyboard, Plus, QrCode } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import message from "~components/ui/message"
import Modal from "~components/ui/modal"
import { parseOtpauthUrl } from "~utils"
import {
  ActionKey,
  DEFAULT_SETTINGS,
  StorageKey,
  type DataProps
} from "~utils/constant"

import OptForm from "./otp-form"

interface CreateProps {
  type?: typeof DEFAULT_SETTINGS.containerType
}

const Create: React.FC<CreateProps> = (props) => {
  const { type } = props
  const [active, setActive] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [dataList, setDataList] = useStorage<DataProps[]>(StorageKey.DATA, [])

  const toggle = () => {
    setActive(!active)
  }

  const handleClose = () => {
    setActive(false)
    setVisible(false)
  }

  const handleQRScan = () => {
    // 发送消息给 content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: ActionKey.AUTOSCAN
        },
        handleQRScanResult
      )
    })
  }

  const handleQRScanResult = (result) => {
    const { success, data, error } = result
    if (success) {
      const parsedData = parseOtpauthUrl(data)
      const nextData = [
        ...dataList,
        {
          id: `${Date.now()}`,
          ...parsedData
        }
      ]
      setActive(false)
      setDataList(nextData)
      message.success("添加成功")
      return
    }
    // 无法自动识别二维码，开启手动截图模式
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return
      chrome.tabs.sendMessage(tabs[0].id, {
        action: ActionKey.MANUAL_SCREENSHOT
      })
      window.close()
    })
  }

  return (
    <div
      className={clsx("absolute flex flex-col items-center z-10", {
        "bottom-8 right-8": type === "phone",
        "bottom-4 right-4": type !== "phone"
      })}>
      {/* 额外的按钮，只有在激活时才显示 */}
      <div
        className={clsx(
          "flex flex-col items-center transition-transform duration-200 ease-out opacity-0 mb-1",
          { "opacity-100": active }
        )}>
        <div
          className="tooltip tooltip-open tooltip-left before:py-2"
          data-tip="手动输入详细信息">
          <button
            onClick={() => setVisible(true)}
            className="btn btn-square btn-accent shadow-2xl scale-75">
            <Keyboard />
          </button>
        </div>
        <div
          className="tooltip tooltip-open tooltip-left before:py-2"
          data-tip="扫描二维码">
          <button
            onClick={handleQRScan}
            className="btn btn-square btn-secondary shadow-2xl scale-75">
            <QrCode />
          </button>
        </div>
      </div>

      {/* 主按钮 */}
      <button
        onClick={toggle}
        className={clsx(
          "btn btn-circle shadow-2xl transition-all duration-200",
          {
            "btn-neutral": !active,
            "btn-primary": active
          }
        )}>
        <Plus
          className={clsx("duration-300 transition-transform", {
            "rotate-45": active
          })}
        />
      </button>

      <OptForm visible={visible} onClose={handleClose} />
    </div>
  )
}

export default Create

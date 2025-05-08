import clsx from "clsx"
import { Keyboard, Plus, QrCode } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Button from "~components/ui/button"
import message from "~components/ui/message"
import { canInjectContentScript, parseOtpAuthUrl } from "~utils"
import { ActionType, StorageKey, type DataProps } from "~utils/constant"

import { GlobalContext } from "./context"
import OptForm from "./otp-form"

interface CreateProps {}

const Create: React.FC<CreateProps> = (props) => {
  const { containerType } = React.useContext(GlobalContext)
  const [active, setActive] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [dataList, setDataList] = useStorage<DataProps[]>(StorageKey.DATA, [])
  const [scaning, setScaning] = React.useState(false)
  const [scanable, setScanable] = React.useState(false)

  React.useEffect(() => {
    canInjectContentScript().then(setScanable)
  }, [])

  const toggle = () => {
    setActive(!active)
  }

  const handleClose = () => {
    setActive(false)
    setVisible(false)
  }

  const isExist = (parsedData) => {
    return dataList.some((item) => {
      return (
        item.type === parsedData.type &&
        item.issuer === parsedData.issuer &&
        item.secret === parsedData.secret &&
        item.account === parsedData.account
      )
    })
  }

  const handleQRScan = () => {
    // 发送消息给 content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: ActionType.AUTOSCAN
        },
        handleQRScanResult
      )
    })
  }

  const handleQRScanResult = (result) => {
    if (!result) return
    const { success, data, error } = result
    if (success) {
      const parsedData = parseOtpAuthUrl(data)
      if (isExist(parsedData)) {
        message.warning("该 QR code 已存在。")
        return
      }
      const nextData: DataProps[] = [
        ...dataList,
        {
          id: `${Date.now()}`,
          ...parsedData
        }
      ]
      setScaning(true)
      setTimeout(() => {
        setActive(false)
        setScaning(false)
        setDataList(nextData)
        message.success("添加成功")
      }, 1000)
      return
    }
    // 无法自动识别二维码，开启手动截图模式
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return
      chrome.tabs.sendMessage(tabs[0].id, {
        action: ActionType.MANUAL_SCREENSHOT
      })
      window.close()
    })
  }

  return (
    <div
      className={clsx("absolute flex flex-col items-center z-10", {
        "bottom-8 right-8": containerType === "phone",
        "bottom-4 right-4": containerType !== "phone"
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
          <Button
            onlyLoading
            loading={scaning}
            onClick={handleQRScan}
            disabled={!scanable}
            className={clsx(
              "btn btn-square btn-secondary shadow-2xl scale-75"
            )}>
            <QrCode />
          </Button>
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

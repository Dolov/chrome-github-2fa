import clsx from "clsx"
import {
  ImageUp,
  Keyboard,
  Plus,
  QrCode,
  SquareDashedMousePointer
} from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Button from "~components/ui/button"
import message from "~components/ui/message"
import Modal from "~components/ui/modal"
import {
  canInjectContentScript,
  isOtpAuthUrl,
  parseOtpAuthUrl,
  readQRCodeFromFile,
  saveOTP
} from "~utils"
import { ActionType, StorageKey, type DataProps } from "~utils/constant"

import { GlobalContext } from "./context"
import { useModalWidth } from "./hooks"
import OptForm from "./otp-form"

interface CreateProps {}

const Create: React.FC<CreateProps> = (props) => {
  const { containerType } = React.useContext(GlobalContext)
  const [active, setActive] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [dataList, setDataList] = useStorage<DataProps[]>(StorageKey.DATA, [])
  const [scaning, setScaning] = React.useState(false)
  const [scanable, setScanable] = React.useState(false)
  const [uploadVisible, setUploadVisible] = React.useState(false)

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

  const handleAutoScan = () => {
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
    const { success, data } = result
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
    const messageText = "未检测到二维码，开启手动截图模式，ESC 退出"
    sendManualScanMessage(messageText)
  }

  const handleManualScan = () => {
    const messageText = "手动截图模式，ESC 退出"
    sendManualScanMessage(messageText)
  }

  const sendManualScanMessage = (messageText: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return
      chrome.tabs.sendMessage(tabs[0].id, {
        action: ActionType.MANUAL_SCREENSHOT,
        message: messageText
      })
      window.close()
    })
  }

  const handleUpload = () => {
    setUploadVisible(true)
  }

  const handleUploadClose = () => {
    setUploadVisible(false)
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
          data-tip="手动输入认证码">
          <button
            onClick={() => setVisible(true)}
            className="btn btn-square btn-secondary shadow-2xl scale-75">
            <Keyboard />
          </button>
        </div>
        <div
          className="tooltip tooltip-open tooltip-left before:py-2"
          data-tip="自动扫描二维码">
          <Button
            onlyLoading
            loading={scaning}
            onClick={handleAutoScan}
            disabled={!scanable}
            className={clsx("btn btn-square btn-accent shadow-2xl scale-75")}>
            <QrCode />
          </Button>
        </div>
        <div
          className="tooltip tooltip-open tooltip-left before:py-2"
          data-tip="手动截取二维码">
          <Button
            onlyLoading
            onClick={handleManualScan}
            disabled={!scanable}
            className={clsx("btn btn-square btn-info shadow-2xl scale-75")}>
            <SquareDashedMousePointer />
          </Button>
        </div>
        <div
          className="tooltip tooltip-open tooltip-left before:py-2"
          data-tip="上传二维码截图">
          <Button
            onlyLoading
            onClick={handleUpload}
            className={clsx("btn btn-square btn-warning shadow-2xl scale-75")}>
            <ImageUp />
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
      <UploadModal visible={uploadVisible} onClose={handleUploadClose} />
    </div>
  )
}

const UploadModal = (props) => {
  const { visible, onClose } = props
  const width = useModalWidth()
  const [error, setError] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile()
        if (blob) {
          // 使用 DataTransfer 来模拟用户选择文件
          const dt = new DataTransfer()
          dt.items.add(blob)
          if (fileInputRef.current) {
            fileInputRef.current.files = dt.files
          }
          processFile(blob)
        }
      }
    }
  }

  const processFile = (file: File) => {
    readQRCodeFromFile(file).then((data) => {
      const isOtpAuth = isOtpAuthUrl(data)
      if (!isOtpAuth) {
        setError(true)
        return
      }
      setError(false)
      const parsedData = parseOtpAuthUrl(data)
      console.log("QRCode Data:", parsedData)
    })
  }

  React.useEffect(() => {
    if (visible) {
      window.addEventListener("paste", handlePaste)
    }
    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [visible])

  return (
    <Modal
      width={width}
      title="上传二维码截图"
      visible={visible}
      onClose={onClose}>
      {error && (
        <div role="alert" className="alert alert-warning flex mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="align-left">这不是一个有效的 OTP Auth URL</span>
        </div>
      )}
      <div className="p-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUploadChange}
          className="file-input file-input-bordered file-input-neutral w-full max-w-xs"
        />
      </div>
      <p className="text-sm text-neutral-500 mt-2">你也可以直接粘贴截图</p>
    </Modal>
  )
}

export default Create

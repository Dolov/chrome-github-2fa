import clsx from "clsx"
import { Keyboard, Plus, QrCode } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Modal from "~components/ui/modal"
import { StorageKey, type DataProps } from "~utils/constant"

import OptForm from "./opt-form"

const Create = () => {
  const [active, setActive] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  const toggle = () => {
    setActive(!active)
  }

  const handleClose = () => {
    setActive(false)
    setVisible(false)
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-center z-10">
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
          <button className="btn btn-square btn-secondary shadow-2xl scale-75">
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

const QRScanCreate = () => {}

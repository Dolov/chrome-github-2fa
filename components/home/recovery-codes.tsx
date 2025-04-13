import { ClipboardCopy } from "lucide-react"
import React from "react"

import message from "~components/ui/message"
import Modal from "~components/ui/modal"
import { type DataProps } from "~utils/constant"
import { copyTextToClipboard } from "~utils/index"

import { useModalWidth } from "./hooks"

export interface RecoveryCodesProps {
  data: DataProps
  title: string
  visible: boolean
  onClose: () => void
}

const RecoveryCodes: React.FC<RecoveryCodesProps> = (props) => {
  const { visible, onClose, title, data } = props
  const width = useModalWidth()

  const handleCopy = (code: string) => {
    copyTextToClipboard(code)
    message.success("复制成功")
  }

  const { recoveryCodes } = data
  return (
    <Modal title={title} width={width} visible={visible} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {recoveryCodes.map((code, index) => (
          <div
            key={code}
            onClick={() => handleCopy(code)}
            className="badge badge-accent w-full flex items-center justify-between px-3 py-2">
            <span className="truncate grow min-w-0">{code}</span>
            <ClipboardCopy
              size={14}
              className="ml-2 cursor-pointer shrink-0 hover:text-white/80 active:scale-95 transition"
            />
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default RecoveryCodes

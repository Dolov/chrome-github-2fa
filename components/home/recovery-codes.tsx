import clsx from "clsx"
import { ClipboardCopy, CopyCheck } from "lucide-react"
import React, { useState } from "react"

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

  // 设置一个状态来跟踪哪个代码被复制，和复制状态
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string) => {
    setCopiedCode(code) // 设置当前复制的代码
    copyTextToClipboard(code)
    setTimeout(() => {
      setCopiedCode(null) // 3秒后恢复为 ClipboardCopy 图标
    }, 3000)
  }

  const { recoveryCodes = [] } = data
  return (
    <Modal title={title} width={width} visible={visible} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {recoveryCodes.map((code) => {
          const isCopied = copiedCode === code
          const CopyIcon = isCopied ? CopyCheck : ClipboardCopy
          return (
            <div
              key={code}
              onClick={() => handleCopy(code)}
              className={clsx(
                "badge w-full flex items-center justify-between px-3 py-2",
                {
                  // "badge-accent": !isCopied,
                  // "badge-secondary": isCopied,
                  "badge-ghost": true
                }
              )}>
              <span className="truncate grow min-w-0 line-through">{code}</span>
              <CopyIcon
                size={14}
                className="ml-2 cursor-pointer shrink-0 hover:text-white/80 active:scale-95 transition"
              />
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export default RecoveryCodes

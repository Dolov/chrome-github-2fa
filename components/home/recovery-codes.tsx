import React from "react"

import Modal from "~components/ui/modal"
import { type DataProps } from "~utils/constant"

import { GlobalContext } from "./context"
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

  const { recoveryCodes } = data
  return (
    <Modal title={title} width={width} visible={visible} onClose={onClose}>
      <div className="flex flex-col gap-3 p-1">123</div>
    </Modal>
  )
}

export default RecoveryCodes

import { Pencil, Pin, PinOff, QrCode, Share2, Trash2 } from "lucide-react"
import React from "react"

import { type DataProps } from "~utils/constant"

const ItemActions: React.FC<{
  visible: boolean
  onClose: () => void
  data: DataProps
}> = (props) => {
  const { visible, onClose, data } = props

  const handleMaskClick = (e) => {
    e.stopPropagation()
  }

  if (!visible) return null
  return (
    <div
      onClick={handleMaskClick}
      className="fixed top-0 left-0 right-0 bottom-0 z-20">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-20"></div>
      <div className="absolute bottom-0 right-0 left-0 h-32 bg-white rounded-t-lg flex flex-col">
        <div className="flex-1 flex items-center justify-between px-4">
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Share2 size={18} />
            <span className="text-xs font-normal">分享</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Pin size={18} />
            <span className="text-xs font-normal">置顶</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <QrCode size={18} />
            <span className="text-xs font-normal">二维码</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Pencil size={18} />
            <span className="text-xs font-normal">编辑</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Trash2 size={18} />
            <span className="text-xs font-normal">删除</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-between px-4 border-t border-neutral/30">
          <span>
            {data.issuer} ({data.account})
          </span>
          <span className="cursor-pointer">取消</span>
        </div>
      </div>
    </div>
  )
}

export default ItemActions

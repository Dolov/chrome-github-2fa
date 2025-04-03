import {
  KeyRound,
  Pencil,
  Pin,
  PinOff,
  QrCode,
  Share2,
  Trash2
} from "lucide-react"
import React, { Fragment } from "react"
import { encodeData, QRDsj } from "react-qrbtf"

import { useStorage } from "@plasmohq/storage/hook"

import Modal from "~components/ui/modal"
import { generateOtpauthUrl } from "~utils"
import { StorageKey, type DataProps } from "~utils/constant"

import OptForm from "./otp-form"

const ItemActions: React.FC<{
  visible: boolean
  onClose: () => void
  itemData: DataProps
}> = (props) => {
  const { visible, onClose, itemData } = props
  const [data, setData] = useStorage<DataProps[]>(StorageKey.DATA, [])
  const [qrVisible, setQrVisible] = React.useState(false)
  const [editVisible, setEditVisible] = React.useState(false)
  const handleMaskClick = (e) => {
    e.stopPropagation()
  }

  const handleDelete = () => {
    const newData = data.filter((item) => item.id !== itemData.id)
    setData(newData)
    onClose()
  }

  const handleEdit = () => {
    setEditVisible(true)
  }

  const handleCopy = () => {}

  const handleShare = () => {}

  const handlePin = () => {
    const item = data.find((item) => item.id === itemData.id)
    const nextPinned = !item.pinned
    const pinnedData = data.filter(
      (item) => item.pinned && item.id !== itemData.id
    )
    const unpinnedData = data.filter(
      (item) => !item.pinned && item.id !== itemData.id
    )
    if (nextPinned) {
      setData([
        {
          ...item,
          pinned: true
        },
        ...pinnedData,
        ...unpinnedData
      ])
    } else {
      setData([
        ...pinnedData,
        {
          ...item,
          pinned: false
        },
        ...unpinnedData
      ])
    }
    onClose()
  }

  const handleQr = () => {
    setQrVisible(true)
  }

  if (!visible) return null

  const { pinned } = itemData
  const url = generateOtpauthUrl(itemData)
  return (
    <div
      onClick={handleMaskClick}
      className="fixed top-0 left-0 right-0 bottom-0 z-20">
      <div
        onClick={onClose}
        className="absolute top-0 left-0 right-0 bottom-0 bg-base-300 opacity-80"
      />
      <OptForm
        visible={editVisible}
        onClose={() => {
          onClose()
          setEditVisible(false)
        }}
        editItem={itemData}
      />
      <Modal
        visible={qrVisible}
        onClose={() => {
          onClose()
          setQrVisible(false)
        }}
        footer={null}>
        <div className="w-full h-full flex flex-col items-center">
          <QRDsj qrcode={encodeData({ text: url })} />
          <div className="text-xl font-bold">
            {itemData.issuer} - {itemData.account}
          </div>
        </div>
      </Modal>
      <div className="absolute bottom-0 right-0 left-0 h-32 bg-base-100 rounded-t-lg flex flex-col">
        <div className="flex-1 flex items-center justify-between px-4">
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Share2 size={18} />
            <span className="text-xs font-normal">分享</span>
          </div>
          <div
            onClick={handlePin}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            {!pinned && (
              <Fragment>
                <Pin size={18} />
                <span className="text-xs font-normal">置顶</span>
              </Fragment>
            )}
            {pinned && (
              <Fragment>
                <PinOff size={18} />
                <span className="text-xs font-normal">取消置顶</span>
              </Fragment>
            )}
          </div>
          <div
            onClick={handleQr}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <QrCode size={18} />
            <span className="text-xs font-normal">二维码</span>
          </div>
          <div
            onClick={handleEdit}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Pencil size={18} />
            <span className="text-xs font-normal">编辑</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <KeyRound size={18} />
            <span className="text-xs font-normal">恢复码</span>
          </div>
          <div
            onClick={handleDelete}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer w-12 h-12 rounded-lg hover:bg-neutral/50">
            <Trash2 size={18} />
            <span className="text-xs font-normal">删除</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-between px-4 border-t border-neutral/30">
          <span>
            {itemData.issuer} ({itemData.account})
          </span>
          <span onClick={onClose} className="cursor-pointer">
            取消
          </span>
        </div>
      </div>
    </div>
  )
}

export default ItemActions

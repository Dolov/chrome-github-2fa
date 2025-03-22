import clsx from "clsx"
import { Keyboard, Plus, QrCode } from "lucide-react"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Modal from "~components/ui/modal"
import { StorageKey, type DataProps } from "~utils/constant"

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

      <ManualCreate visible={visible} onClose={handleClose} />
    </div>
  )
}

export default Create

const defaultForm = {
  issuer: "",
  secret: "",
  account: "",
  remark: ""
}

const ManualCreate: React.FC<{
  visible: boolean
  onClose: () => void
  editItem?: any
}> = (props) => {
  const { visible, onClose, editItem } = props
  const [data, setData] = useStorage<DataProps[]>(StorageKey.DATA, [])
  const title = "输入账户详细信息"
  const [form, setForm] = React.useState(defaultForm)

  const handleOk = () => {
    const { issuer, secret, account, remark } = form
    if (!issuer || !secret || !account) return
    if (editItem) {
      const newData = data.map((item) => {
        if (item.id === editItem.id) {
          return {
            ...item,
            issuer,
            secret,
            account,
            remark
          }
        }
        return item
      })
      setData(newData)
    } else {
      const id = `${Date.now()}`
      const item = {
        id,
        type: "totp",
        issuer,
        secret,
        account,
        remark
      }
      setData([...data, item])
    }
    onClose()
    setForm(defaultForm)
  }
  return (
    <Modal onOk={handleOk} title={title} visible={visible} onClose={onClose}>
      <div className="flex flex-col gap-3 p-1">
        <label className="input input-bordered flex items-center gap-2">
          平台
          <input
            type="text"
            className="grow"
            placeholder="例如：Github"
            value={form.issuer}
            onChange={(e) => {
              setForm({ ...form, issuer: e.target.value })
            }}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          密钥
          <input
            type="text"
            className="grow"
            placeholder="例如：N2CNXXJV7GG75PUI"
            value={form.secret}
            onChange={(e) => {
              setForm({ ...form, secret: e.target.value })
            }}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          帐户
          <input
            type="text"
            className="grow"
            placeholder="例如：Dolov"
            value={form.account}
            onChange={(e) => {
              setForm({ ...form, account: e.target.value })
            }}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          备注
          <input
            type="text"
            className="grow"
            placeholder="例如：账户类型、用途等"
            value={form.remark}
            onChange={(e) => {
              setForm({ ...form, remark: e.target.value })
            }}
          />
        </label>
        {editItem && (
          <label className="form-control">
            <div className="label">
              <span className="label-text">恢复码</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-20"
              placeholder="支持空格、换行、逗号，顿号等格式 例如：xxxx-xxxx,xxxx-xxxx"></textarea>
          </label>
        )}
      </div>
    </Modal>
  )
}

const QRScanCreate = () => {}

import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Modal from "~components/ui/modal"
import { StorageKey, type DataProps } from "~utils/constant"

const defaultForm = {
  issuer: "",
  secret: "",
  account: "",
  remark: ""
}

const OtpForm: React.FC<{
  visible: boolean
  onClose: () => void
  editItem?: any
}> = (props) => {
  const { visible, onClose, editItem } = props
  const [data, setData] = useStorage<DataProps[]>(StorageKey.DATA, [])
  const title = "输入账户详细信息"
  const [form, setForm] = React.useState({
    ...defaultForm,
    ...editItem
  })

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

export default OtpForm

import React, { useState } from "react"
import { IconGithubLogo, IconCopy } from '@douyinfe/semi-icons';
import { Tag, RadioGroup, Radio, Progress, Empty, Typography, Banner } from '@douyinfe/semi-ui';
import { IllustrationConstruction } from '@douyinfe/semi-illustrations';
import { dataSource, type DataProps, authenticator, authenticatorOptions, copyTextToClipboard } from './util'
import i18n from './i18n'

const { Title } = Typography;

function IndexPopup() {
  const [store, setStore] = useState<Record<string, DataProps>>({})
  const [groupState, setGroupState] = React.useState({})

  React.useEffect(() => {
    // 获取初始化数据
    dataSource.get().then(res => {
      setStore(res)
    })
  }, [])

  const onRadioGroupChange = (e, name) => {
    setGroupState({
      ...groupState,
      [name]: e.target.value
    })
  }

  const handleCopy = (type, item) => {
    copyTextToClipboard(item.value)
    const data = store[type]
    const codes = data.recoveryCodes.map(itemc => {
      if (itemc.value === item.value) {
        return {
          ...itemc,
          copyed: true
        }
      }
      return itemc
    })

    const newStore: Record<string, DataProps> = {
      ...store,
      [type]: {
        ...store[type],
        recoveryCodes: codes
      }
    }

    setStore(newStore)
    dataSource.save(newStore)
  }

  return (
    <div style={{ width: 300, padding: 6, margin: 0 }}>
      {Object.keys(store).map(type => {
        const { recoveryCodes = [], account, secret } = store[type]
        const value = groupState[type] || "2FA"
        const tfaVisible = value === "2FA"
        const recoveryVisible = value === "Recovery"

        return (
          <div key={type}>
            <RadioGroup
              type='button'
              value={value}
              style={{ display: "flex", "alignItems": "center" }}
              onChange={e => onRadioGroupChange(e, type)}
            >
              <Radio value="2FA">
                <Tag
                  size="small"
                  type='light'
                  shape='circle'
                  style={{ maxWidth: 160, color: tfaVisible && "var(--semi-color-primary)" }}
                  prefixIcon={<IconGithubLogo />}
                >
                  {account}
                </Tag>
              </Radio>
              <Radio value="Recovery">{i18n("recoveryCodes")}</Radio>
            </RadioGroup>
            <div style={{ margin: "12px 0 8px 0" }}>
              {tfaVisible && (
                <TFACode secret={secret} />
              )}
              {recoveryVisible && (
                <div>
                  <WarningBanner data={recoveryCodes} />
                  <NoRecoveryCodes data={recoveryCodes} />
                  <RecoveryCodes data={recoveryCodes} type={type} handleCopy={handleCopy} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}


const RecoveryCodes = props => {
  const { type, data, handleCopy } = props
  return (
    <div>
      {data.map((item, index) => {
        const { value, copyed } = item
        const style = {
          width: 120,
          margin: "0 8px 8px 0",
          textDecoration: copyed ? "line-through" : "auto",
        }
        return (
          <Tag
            key={value}
            size='large'
            type='light'
            shape='circle'
            color={`${copyed ? "grey" : "light-blue"}`}
            style={style}
            suffixIcon={!copyed && <IconCopy onClick={() => handleCopy(type, item)} style={{ cursor: "pointer" }} />}
          >
            {value}
          </Tag>
        )
      })}
    </div>
  )
}


const NoRecoveryCodes = props => {
  const { data } = props

  if (data.length > 0) return null
  return (
    <Empty
      title={i18n("nodata")}
      image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
      description={
        <a style={{ textDecoration: "underline" }} href="https://github.com/settings/security?type=app#two-factor-summary">
          {i18n("noRecoveryCodes")}
        </a>
      }
    />
  )
}

const WarningBanner = props => {
  const { data } = props
  /** 尚未使用的找回码 */
  const restCodes = data.filter(item => !item.copyed)

  if (restCodes.length > 3) return null
  if (!restCodes.length) return null
  return (
    <Banner
      style={{ marginBottom: 8 }}
      type="warning"
      description={
        <a style={{ textDecoration: "underline" }} href="https://github.com/settings/security?type=app#two-factor-summary">
          {i18n("recoveryCodesLessTip", restCodes.length)}
        </a>
      }
    />
  )
}

const TFACode = props => {
  const { secret } = props
  const [percent, setPercent] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      const timeUsed = authenticator.timeUsed()
      const percent = Math.ceil((timeUsed / authenticatorOptions.step) * 100)
      setPercent(percent)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const type = percent > 85 ? "warning" : "primary"
  return (
    <div>
      <Progress size="small" stroke={`var(--semi-color-${type})`} percent={percent} />
      <Title copyable style={{ padding: "8px 0" }}>
        {authenticator.generate(secret)}
      </Title>
    </div>
  )
}

export default IndexPopup

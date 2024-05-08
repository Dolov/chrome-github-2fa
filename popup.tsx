import React, { useState } from "react"
import { IconLink } from '@douyinfe/semi-icons';
import { useStorage } from "@plasmohq/storage/hook"
import { IconGithubLogo, IconCopy } from '@douyinfe/semi-icons';
import { Tag, RadioGroup, Radio, Progress, Empty, Typography, Banner, Avatar, Button, Toast } from '@douyinfe/semi-ui';
import { IllustrationConstruction } from '@douyinfe/semi-illustrations';
import {
  dataSource, type DataProps, authenticator, authenticatorOptions, copyTextToClipboard,
  SECURITY_URL, gmailIconUrl, createGmailDraftMessage,
} from '~/util'
import i18n from '~/i18n'
import './style.css'

const { Title, Text } = Typography;

const containerStyle: React.CSSProperties = {
  width: 300, padding: 6, margin: 0
}


function IndexPopup() {
  const [store, setStore] = useState<Record<string, DataProps>>(null)
  const [groupState, setGroupState] = React.useState({})

  React.useEffect(() => {
    // 获取初始化数据
    dataSource.get().then(res => {
      setStore(res || {})
    })
  }, [])

  const onRadioGroupChange = (e, account) => {
    setGroupState({
      ...groupState,
      [account]: e.target.value
    })
  }

  const handleCopy = (account, item) => {
    copyTextToClipboard(item.value)
    const params = store[account]
    const codes = params.recoveryCodes.map(itemc => {
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
      [account]: {
        ...store[account],
        recoveryCodes: codes
      }
    }

    setStore(newStore)
    dataSource.save(newStore)
  }

  if (!store) return null

  if (!Object.keys(store).length) {
    return (
      <div style={containerStyle}>
        <Empty
          title={i18n("nodata")}
          image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
          description={
            <Text
              underline
              icon={<IconLink />}
              link={{ href: SECURITY_URL }}
            >
              {i18n("startTip")}
            </Text>
          }
        />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <Disclaimers />
      {/* <button onClick={() => dataSource.save({})}>clear</button> */}
      {Object.keys(store).map(account => {
        const { recoveryCodes = [], secret } = store[account]
        const value = groupState[account] || "2FA"
        const tfaVisible = value === "2FA"
        const saveVisible = value === "Save"
        const recoveryVisible = value === "Recovery"
        return (
          <div key={account}>
            <RadioGroup
              type='button'
              value={value}
              style={{ display: "flex", "alignItems": "center" }}
              onChange={e => onRadioGroupChange(e, account)}
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
              <Radio value="Save">
                {/* <IconSave /> */}
                <Avatar
                  alt='User'
                  size="extra-extra-small"
                  style={{ margin: "0 4px 0 2px", display: "inline-flex" }}
                  border={{ motion: saveVisible }}
                  contentMotion={saveVisible}
                  src={gmailIconUrl}
                />
              </Radio>
            </RadioGroup>
            <div style={{ margin: "12px 0 8px 0" }}>
              {tfaVisible && (
                <TFACode secret={secret} />
              )}
              {recoveryVisible && (
                <div>
                  <WarningBanner data={recoveryCodes} />
                  <NoRecoveryCodes data={recoveryCodes} />
                  <RecoveryCodes data={recoveryCodes} account={account} handleCopy={handleCopy} />
                </div>
              )}
              {saveVisible && (
                <ContinueWithGoogle account={account} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ContinueWithGoogle = props => {
  const { account } = props
  const [loading, setLoading] = React.useState(false)
  const [userInfo, setUserInfo] = React.useState<{ email?: string }>({})

  React.useEffect(() => {
    getProfileUserInfo()
  }, [])

  const getProfileUserInfo = () => {
    chrome.identity.getProfileUserInfo(userInfo => {
      setUserInfo(userInfo)
    })
  }

  const withGoogle = async () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      getProfileUserInfo()
    })
  }

  const createGmailDraft = () => {
    setLoading(true)
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      getProfileUserInfo()
      const data = await dataSource.get()
      const { issuer, secret, recoveryCodes = [] } = data[account]
      const codes = recoveryCodes.map(item => item.value).join("、")
      createGmailDraftMessage(token, {
        subject: `Github 2FA (${account}) - ${new Date().toLocaleDateString()}`,
        content: `
          2FA issuer: ${issuer} \n
          2FA secret: ${secret} \n
          Github Recrecovery Codes: ${codes}
        `,
      }).then(res => {
        if (res.error) {
          Toast.error(res.error.message)
          return
        }
        Toast.success(i18n("savedSuccessfully"))
      }).catch(err => {
        Toast.error(err)
      }).finally(() => {
        setLoading(false)
      })
    })
  }

  const { email } = userInfo || {}

  if (email) {
    return (
      <div>
        <Button loading={loading} onClick={createGmailDraft}>{i18n("createGmailDraft")}</Button>
        <Text
          underline
          link={{ href: "https://mail.google.com/" }}
          style={{ marginTop: 16, display: "flex", alignItems: "center" }}
        >
          {email}
        </Text>
      </div>
    )
  }

  return (
    <Button>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img style={{ width: 20, height: 20, marginRight: 8 }} src={gmailIconUrl} alt="" />
        <span onClick={withGoogle}>{i18n("withGoogle")}</span>
      </div>
    </Button>
  )
}


const RecoveryCodes = props => {
  const { account, data, handleCopy } = props
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
            suffixIcon={!copyed && <IconCopy onClick={() => handleCopy(account, item)} style={{ cursor: "pointer" }} />}
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
        <a style={{ textDecoration: "underline" }} href={SECURITY_URL}>
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
        <a
          style={{ textDecoration: "underline" }}
          href={SECURITY_URL}
        >
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
    if (!secret) return
    const timer = setInterval(() => {
      const timeUsed = authenticator.timeUsed()
      const percent = Math.ceil((timeUsed / authenticatorOptions.step) * 100)
      setPercent(percent)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [secret])

  if (!secret) {
    return (
      <Text style={{ fontWeight: 900 }}>
        <span>{i18n("noSectet")}</span>
        <Text
          underline
          icon={<IconLink />}
          link={{ href: SECURITY_URL }}
        >
          {i18n("goToGen")}
        </Text>
      </Text>
    )
  }

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

const Disclaimers = props => {

  const [visible, setVisible] = useStorage("disclaimerVisible", true)

  const onClose = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Banner
      style={{ fontWeight: 900, marginBottom: 4 }}
      type="warning"
      onClose={onClose}
      description={
        <div>
          <div>{i18n("declare")}</div>
          <div style={{ marginTop: 8 }}>{i18n("saveToGmailDeclare")}</div>
        </div>
      }
    />
  )
}

export default IndexPopup

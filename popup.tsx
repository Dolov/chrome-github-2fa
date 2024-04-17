import React, { useState } from "react"
import { dataSource, recoveryCodeDataSource } from './util'



function IndexPopup() {
  const [recoveryCodes = {}, setRecoveryCodes] = useState<Record<string, { value: string, copyed: boolean }[]>>()

  React.useEffect(() => {
    recoveryCodeDataSource.get().then(res => {
      setRecoveryCodes(res)
    })
  }, [])

  return (
    <div style={{ width: 300 }}>
      {Object.keys(recoveryCodes).map(name => {
        const codes = recoveryCodes[name]
        return (
          <div key={name}>
            <h5>{name}</h5>
            {codes.map(item => {
              const { value, copyed } = item
              return (
                <div key={value}>{value}</div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default IndexPopup

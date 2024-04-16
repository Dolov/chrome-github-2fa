import React, { useState } from "react"
import { dataSource } from './util'



function IndexPopup() {
  const [data, setData] = useState("")

  React.useEffect(() => {
    dataSource.get().then(data => {
      console.log('data: ', data);
    })
  }, [])

  return (
    <div>
      1234
    </div>
  )
}

export default IndexPopup

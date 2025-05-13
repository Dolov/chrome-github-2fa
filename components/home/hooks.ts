import React from "react"

import { GlobalContext } from "./context"

export const useModalWidth = () => {
  const { containerType } = React.useContext(GlobalContext)

  if (containerType === "phone") {
    return {
      width: "85%",
      left: "15px",
      right: "15px",
      top: "14px",
      bottom: "18px",
      radius: "40px"
    }
  }

  return {
    width: "94%",
    left: "0",
    right: "0",
    top: "0",
    bottom: "0"
  }
}

export const useFilter = () => {
  const { filter, setFilter } = React.useContext(GlobalContext)
  return [filter, setFilter] as const
}

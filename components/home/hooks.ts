import React from "react"

import { GlobalContext } from "./context"

export const useModalWidth = () => {
  const { containerType } = React.useContext(GlobalContext)

  return containerType === "phone" ? "85%" : "94%"
}

export const useFilter = () => {
  const { filter, setFilter } = React.useContext(GlobalContext)
  return [filter, setFilter] as const
}

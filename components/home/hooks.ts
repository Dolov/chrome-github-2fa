import React from "react"

import { GlobalContext } from "./context"

export const useModalWidth = () => {
  const { containerType } = React.useContext(GlobalContext)

  return containerType === "phone" ? "88%" : "94%"
}

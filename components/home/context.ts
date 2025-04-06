import React from "react"

import { ContainerType, SourceType } from "~utils/constant"

export interface GlobalContextProps {
  source: SourceType
  containerType: ContainerType
}

export const GlobalContext = React.createContext<GlobalContextProps>({
  source: SourceType.POPUP,
  containerType: ContainerType.DEFAULT
})

const { Provider, Consumer } = GlobalContext

export { Provider, Consumer }

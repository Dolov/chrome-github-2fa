import React from "react"

export interface GlobalContextProps {
  source: "settings" | "popup"
  containerType: "phone" | "default"
}

export const GlobalContext = React.createContext<GlobalContextProps>({
  source: "popup",
  containerType: "default"
})

const { Provider, Consumer } = GlobalContext

export { Provider, Consumer }

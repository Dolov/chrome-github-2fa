import React from "react"

export const GlobalContext = React.createContext<{
  containerType: "phone" | "default"
}>({
  containerType: "default"
})

const { Provider, Consumer } = GlobalContext

export { Provider, Consumer }

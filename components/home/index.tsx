import React from "react"

import Container, { type ContainerProps } from "./container"
import { Provider } from "./context"
import Create from "./create"
import Header from "./header"
import List from "./list"

interface HomeProps {
  source: "settings" | "popup"
  containerType: ContainerProps["type"]
}

const Home: React.FC<HomeProps> = (props) => {
  const { containerType, source = "popup" } = props

  return (
    <Provider value={{ containerType }}>
      <Container>
        <Header />
        <List />
        <Create />
      </Container>
    </Provider>
  )
}

export default Home

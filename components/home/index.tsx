import React from "react"

import { ContainerType, SourceType } from "~utils/constant"

import Container from "./container"
import { Provider } from "./context"
import Create from "./create"
import Header from "./header"
import List from "./list"

interface HomeProps {
  source: SourceType
  containerType: ContainerType
}

const Home: React.FC<HomeProps> = (props) => {
  const { containerType, source } = props

  return (
    <Provider value={{ source, containerType }}>
      <Container>
        <Header />
        <List />
        <Create />
      </Container>
    </Provider>
  )
}

export default Home

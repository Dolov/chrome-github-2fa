import React from "react"

import Container, { type ContainerProps } from "./container"
import Create from "./create"
import Header from "./header"
import List from "./list"

interface HomeProps {
  containerType: ContainerProps["type"]
}

const Home: React.FC<HomeProps> = (props) => {
  const { containerType } = props
  return (
    <Container type={containerType}>
      <Header type={containerType} />
      <List />
      <Create type={containerType} />
    </Container>
  )
}

export default Home

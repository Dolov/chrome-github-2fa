import React from "react"

import Container from "~components/home/container"
import Create from "~components/home/create"
import Header from "~components/home/header"
import List from "~components/home/list"
import { mockData, type DataProps } from "~utils/constant"

import "./style.less"

const Home = () => {
  return (
    <Container>
      <Header />
      <List />
      <Create />
    </Container>
  )
}

export default Home

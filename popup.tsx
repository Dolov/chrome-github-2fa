import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Main from "~components/home"
import { DEFAULT_SETTINGS, SourceType, StorageKey } from "~utils/constant"
import { useThemeChange } from "~utils/hooks"

import "./style.less"

const Home = () => {
  useThemeChange()
  const [settings] = useStorage(StorageKey.SETTINGS, DEFAULT_SETTINGS)

  return (
    <Main source={SourceType.POPUP} containerType={settings.containerType} />
  )
}

export default Home

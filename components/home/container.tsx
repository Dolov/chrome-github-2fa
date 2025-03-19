import clsx from "clsx"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { DEFAULT_SETTINGS, StorageKey } from "~utils/constant"

import Phone from "./phone"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

const Container: React.FC<ContainerProps> = (props) => {
  const { children, className } = props
  const [settings] = useStorage(StorageKey.SETTINGS, DEFAULT_SETTINGS)
  if (settings.containerType === "phone") {
    return <Phone className={className}>{children}</Phone>
  }
  return (
    <div className={clsx("w-[350px] h-[582px] px-4 bg-base-100 flex flex-col")}>
      {children}
    </div>
  )
}

export default Container

import clsx from "clsx"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { DEFAULT_SETTINGS, StorageKey } from "~utils/constant"

import Phone from "./phone"

export interface ContainerProps {
  type?: typeof DEFAULT_SETTINGS.containerType
  children: React.ReactNode
  className?: string
}

const Container: React.FC<ContainerProps> = (props) => {
  const { children, type } = props
  if (type === "phone") {
    return <Phone className="relative w-[350px] h-[600px]">{children}</Phone>
  }
  return (
    <div
      className={clsx(
        "relative w-[350px] h-[600px] bg-base-100 flex flex-col"
      )}>
      {children}
    </div>
  )
}

export default Container

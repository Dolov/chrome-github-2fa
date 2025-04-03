import clsx from "clsx"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { DEFAULT_SETTINGS, StorageKey } from "~utils/constant"

import { GlobalContext } from "./context"
import Phone from "./phone"

export interface ContainerProps {
  children: React.ReactNode
  className?: string
}

const Container: React.FC<ContainerProps> = (props) => {
  const { children } = props
  const { containerType } = React.useContext(GlobalContext)
  if (containerType === "phone") {
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

import clsx from "clsx"
import React from "react"

interface OptProps {
  children: string
  small?: boolean
  className?: string
}

const Opt: React.FC<OptProps> = (props) => {
  const { children, className, small } = props
  const first = children.slice(0, 3)
  const last = children.slice(3)

  return (
    <div className={className}>
      <span
        className={clsx("mr-2", {
          "mr-1": small
        })}>
        {first}
      </span>
      <span>{last}</span>
    </div>
  )
}

export default Opt

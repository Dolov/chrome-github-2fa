import React from "react"

import { getProgressColor, getRemainingTime } from "~utils"

interface OtpRemainingProps {
  className?: string
}

const OtpRemaining: React.FC<OtpRemainingProps> = (props) => {
  const { className } = props
  const interval = React.useRef(null)

  const [timeRemaining, setTimeRemaining] = React.useState(() => {
    return getRemainingTime()
  })

  React.useEffect(() => {
    interval.current = setInterval(() => {
      setTimeRemaining(getRemainingTime())
    }, 1000)

    return () => clearInterval(interval.current)
  }, [])

  const color = getProgressColor(timeRemaining)

  return (
    <progress
      max={30}
      value={timeRemaining}
      className={`progress ${color} w-full h-[3px] bg-base-200 ${className}`}
    />
  )
}

export default OtpRemaining

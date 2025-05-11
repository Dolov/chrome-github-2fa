import clsx from "clsx"
import React from "react"

import { generateOtp } from "~utils"

interface OtpTextProps {
  secret: string
  next?: boolean
  small?: boolean
  className?: string
}

const OtpText: React.FC<OtpTextProps> = (props) => {
  const { secret, className, small, next = false } = props
  const interval = React.useRef(null)

  const [otp, setOtp] = React.useState(() => {
    return generateOtp(secret, next)
  })
  const first = otp.slice(0, 3)
  const last = otp.slice(3)

  React.useEffect(() => {
    interval.current = setInterval(() => {
      setOtp(generateOtp(secret, next))
    }, 1000)

    return () => clearInterval(interval.current)
  }, [next])

  return (
    <div className={className}>
      <span
        className={clsx({
          "mr-1": small,
          "mr-2": !small
        })}>
        {first}
      </span>
      <span>{last}</span>
    </div>
  )
}

export default OtpText

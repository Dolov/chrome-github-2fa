import React from "react"

interface PhoneProps {
  children: React.ReactNode
  className?: string
}

const Phone: React.FC<PhoneProps> = (props) => {
  const { children } = props
  return (
    <div className="h-full flex flex-col">
      <div className="mockup-phone flex flex-col flex-1">
        <div className="camera"></div>
        <div className="display">
          <div className="artboard artboard-demo phone-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Phone

import Progress from "qier-progress"
import React from "react"

const QProgress = (props) => {
  const {
    loading,
    children,
    progressHeight = 5,
    className,
    style,
    value
  } = props
  const progressRef = React.useRef(null)

  React.useEffect(() => {
    if (!progressRef.current) return
    if (loading) {
      progressRef.current.start()
    } else {
      progressRef.current.finish()
    }
  }, [loading])

  const ref = React.useCallback((element) => {
    if (!element) {
      progressRef.current = null
      return
    }

    progressRef.current =
      progressRef.current ||
      new Progress({ parentNode: element, height: progressHeight })
  }, [])

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
}

export default QProgress

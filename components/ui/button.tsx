import clsx from "clsx"
import React from "react"

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  disabled?: boolean
  onlyLoading?: boolean
  loadingClassName?: string
}

const Button = (props: ButtonProps) => {
  const {
    loading,
    disabled,
    onlyLoading,
    loadingClassName,
    children,
    ...otherProps
  } = props

  const buttonChildren = onlyLoading && loading ? null : children
  const loadingSize = loadingClassName?.includes?.("loading-xs")
    ? "loading-xs"
    : "loading-md"
  return (
    <button {...otherProps} disabled={loading || disabled}>
      {loading && (
        <span
          className={clsx(
            "loading loading-spinner",
            loadingSize,
            loadingClassName
          )}
        />
      )}
      {buttonChildren}
    </button>
  )
}

export default Button

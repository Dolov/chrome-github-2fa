import React, { Fragment } from "react"

const ContextMenu: React.FC<{
  className?: string
  children: React.ReactNode
  menus: {
    id: string
    label: React.ReactNode
  }[]
  handleMenuClick: (id: string) => void
}> = (props) => {
  const { className, children, handleMenuClick, menus } = props
  const [visible, setVisible] = React.useState(false)
  const menuRef = React.useRef<HTMLUListElement>(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setVisible(false)
    }
  }

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      setVisible(false)
    }
  }

  React.useEffect(() => {
    document.removeEventListener("click", handleClickOutside)
    document.removeEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    // 获取鼠标点击的 Y 坐标
    const mouseY = event.clientY
    const mouseX = event.clientX

    // 获取页面的总高度和窗口的可视高度
    const pageHeight = document.documentElement.scrollHeight

    // 计算鼠标下方和上方的剩余空间
    const spaceBelow = pageHeight - mouseY // 鼠标下方的空间
    const spaceAbove = mouseY // 鼠标上方的空间

    // 假设菜单的高度
    const menuHeight = 400 // 你可以根据实际菜单高度动态调整

    // 默认菜单位置是鼠标点击位置
    let newMenuPosition = { x: mouseX, y: mouseY }

    // 判断是否有足够的空间显示菜单
    if (spaceBelow >= menuHeight) {
      // 如果下方有足够的空间，显示在鼠标下方
      newMenuPosition.y = mouseY
    } else if (spaceAbove >= menuHeight) {
      // 如果下方没有足够的空间，上方有足够的空间，显示在鼠标上方
      newMenuPosition.y = mouseY - menuHeight
    } else {
      // 如果上下都没有足够的空间，这里可以选择显示在某个固定位置或其他逻辑
      // 例如，显示在页面中间或其他位置
      newMenuPosition.y = Math.max(0, pageHeight - menuHeight)
    }

    setVisible(true)
    setPosition(newMenuPosition)
  }

  const title = "1234"
  return (
    <div className={className} onContextMenu={onContextMenu}>
      {children}
      {visible && (
        <Fragment>
          <ul
            ref={menuRef}
            style={{ top: position?.y, left: position?.x }}
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] min-w-40 max-w-52 p-2 shadow fixed">
            <li title={title} className="menu-title w-full">
              <p className="w-full flex items-center">
                {/* <TitleIcon className="w-4 min-w-4" /> */}
                <span className="ml-2 flex-1 text-ellipsis">{title}</span>
              </p>
            </li>
            <div className="divider m-0" />
            {menus.map((menu, index) => {
              const { id, label } = menu
              return (
                <li key={id} onClick={() => handleMenuClick(id)}>
                  <a>{label}</a>
                </li>
              )
            })}
          </ul>
        </Fragment>
      )}
    </div>
  )
}

export default ContextMenu

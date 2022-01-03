import cx from "classnames"
import { ForwardedRef, forwardRef, MouseEventHandler, ReactNode, Ref, RefObject, useCallback, useEffect, useRef, useState } from "react"

type ContextProps = {
  renderMenu: (ref: RefObject<HTMLDivElement>, position: Pos) => ReactNode
  children: ReactNode,
}

type Pos = { top: number, left: number }

export function Context({renderMenu, children}: ContextProps) {
  const boudaryRef: RefObject<HTMLDivElement> = useRef(null)
  const menuRef: RefObject<HTMLDivElement> = useRef(null)
  const [position, setPosition] = useState(undefined as Pos | undefined)
  const onContextMenu: MouseEventHandler = useCallback((e) => {
    if (!boudaryRef.current) return
    const { top, left } = boudaryRef.current.getBoundingClientRect()
    setPosition({
      top: e.clientY - top,
      left: e.clientX - left,
    })
    e.preventDefault()
  }, [])
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (position && e.target instanceof Element && !menuRef.current?.contains(e.target)) {
        setPosition(undefined)
      }
    }
    window.document.body.addEventListener("click", clickHandler)
    window.document.body.addEventListener("contextmenu", clickHandler)
    return () => {
      window.document.body.removeEventListener("click", clickHandler)
      window.document.body.removeEventListener("contextmenu", clickHandler)
    }
  }, [position])
  return (
    <div ref={boudaryRef} onContextMenu={onContextMenu}>
      {position ? renderMenu(menuRef, position) : null}
      {children}
    </div>
  )
}

export const Menu = forwardRef((
    {className, ...props}: JSX.IntrinsicElements["div"],
    ref: ForwardedRef<HTMLDivElement>
  ): JSX.Element => (
  <div ref={ref} className={cx("ContextMenu-Menu", className)} {...props} />
))

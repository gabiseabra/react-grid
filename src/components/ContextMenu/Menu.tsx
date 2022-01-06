import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"
import cx from "classnames"
import { createContext, CSSProperties, ForwardedRef, forwardRef, MouseEventHandler, ReactNode, useCallback, useContext, useEffect, useState } from "react"

type MenuContext = {
  activeItem?: string
  setActiveItem: (id?: string) => void
}

const MenuContext = createContext({
  activeItem: undefined,
  setActiveItem: () => null,
} as MenuContext)

export const Menu = forwardRef(function MenuComponent(
    {className, children, onClick: $onClick, ...props}: JSX.IntrinsicElements["div"],
    ref: ForwardedRef<HTMLDivElement>
  ): JSX.Element {
    const [activeItem, setActiveItem] = useState(undefined as string | undefined)
    const onClick = useCallback((e) => {
        $onClick?.(e)
        e.stopPropagation()
    }, [$onClick])
    return (
      <div
        ref={ref}
        className={cx("ContextMenu-Menu", className)}
        onClick={onClick}
        {...props}
      >
        <MenuContext.Provider value={{activeItem, setActiveItem}}>
          {children}
        </MenuContext.Provider>
      </div>
    )
  })

type SubMenuProps = {
  id: string
  label: string
  children: ReactNode
}

export function SubMenu({id, label, children}: SubMenuProps): JSX.Element {
  const [activeItem, setActiveItem] = useState(undefined as string | undefined)
  const parent = useContext(MenuContext)
  const onEnter = useCallback(() => parent.setActiveItem(id), [])
  const onLeave = useCallback(() => parent.setActiveItem(undefined), [])
  return (
    <MenuContext.Provider value={{activeItem, setActiveItem}}>
      {typeof parent.activeItem === "undefined"
        ? <button className="ContextMenu-Button" onClick={onEnter}>{label}</button>
        : parent.activeItem === id
        ? (
          <div className="ContextMenu-SubMenu">
            {!activeItem && (
              <button className="ContextMenu-Button ContextMenu-Back" onClick={onLeave}>
                <Icon icon={faChevronLeft} />
                <span>RETURN</span>
              </button>
            )}
            <main>
              {children}
            </main>
          </div>
        ) : null
      }
    </MenuContext.Provider>
  )
}

type ConfirmationState = "NOT_CONFIRMED" | "CONFIRM" | "CONFIRMED"

type ConfirmProps<args extends any[]> = {
  onConfirmed: (...args: args) => void
  children: (fn: (...args: args) => void, state: ConfirmationState) => ReactNode
}

export function Confirm<args extends any[]>({ onConfirmed, children }: ConfirmProps<args>): JSX.Element {
  const [state, setState] = useState("NOT_CONFIRMED" as ConfirmationState)
  const onConfirm = useCallback((...args: args) => {
    if (state === "CONFIRM") {
      setState("CONFIRMED")
      onConfirmed(...args)
    } else {
      setState("CONFIRM")
    }
  }, [state, onConfirmed])
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state === "CONFIRM") setState("NOT_CONFIRMED") 
    }
    window.addEventListener("keydown", keyDownHandler)
    return () => window.removeEventListener("keydown", keyDownHandler)
  })
  return <>{children(onConfirm, state)}</>
}

export type ButtonProps = {
  className?: string
  style?: CSSProperties
  onClick?: MouseEventHandler
  children: ReactNode
}

export function Button({className, ...props}: ButtonProps): JSX.Element {
  const { activeItem } = useContext(MenuContext)
  if (activeItem) return <></>
  return <button className={cx("ContextMenu-Button", className)} {...props} />
}


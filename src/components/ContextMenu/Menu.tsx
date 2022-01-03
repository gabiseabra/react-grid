import cx from "classnames"
import { createContext, CSSProperties, ForwardedRef, forwardRef, MouseEventHandler, ReactNode, useCallback, useContext, useState } from "react"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"

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

type ConfirmProps = {
  onConfirmed: MouseEventHandler
  children: (confirmed)
}

export function Confirm({ onConfirmed }) {

  const [confirmed, setConfirmed] = useState(false)
  const onClick: MouseEventHandler = useCallback((e) => {
  })
  if (!confirmed) {
      
  } 

}

export type ButtonProps = {
  className?: string
  style?: CSSProperties
  onClick?: MouseEventHandler
  children: ReactNode
  confirm?: boolean
}

export function Button({className, ...props}: ButtonProps): JSX.Element {
  const { activeItem } = useContext(MenuContext)
  if (activeItem) return <></>
  return <button className={cx("ContextMenu-Button", className)} {...props} />
}


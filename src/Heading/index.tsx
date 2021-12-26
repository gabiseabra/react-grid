import throttle from 'lodash/throttle'
import "./Heading.scss"
import cx from "classnames"
import { ColT } from "../lib/Table"
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons/faThumbtack'
import { useCallback } from "react"
import { ResizableBox } from 'react-resizable'

type HeadingProps = {
  column: ColT<any>
  pinned?: boolean,
  setPinned?: (pinned: boolean) => void,
  size: { width: number, height: number },
  setWidth: (width: number) => void
}

export function Heading({ column, pinned, setPinned, size, setWidth }: HeadingProps): JSX.Element {
  const onResize = useCallback(throttle((e, { size }) => setWidth(size.width), 5), [])
  return (
    <ResizableBox
      axis="x"
      width={size.width}
      height={size.height}
      onResize={onResize}
      minConstraints={[100, size.height]}
      resizeHandles={["e"]}
      className='column-heading'
    >
      <span>{column.id}</span>
      <div className="controls">
        <button
          className={cx("pin-control", { disabled: !pinned })}
          onClick={() => setPinned && setPinned(!pinned)}
        >
          <Icon icon={faThumbtack} />
        </button>
      </div>
    </ResizableBox>
  )
}
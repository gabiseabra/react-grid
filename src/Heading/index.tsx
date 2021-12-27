import throttle from 'lodash/throttle'
import "./Heading.scss"
import cx from "classnames"
import { ColT } from "../lib/Table"
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons/faThumbtack'
import { useCallback } from "react"
import { Resizable } from 'react-resizable'
import { useDrag, useDrop } from 'react-dnd'

type HeadingProps = {
  column: ColT<any>
  columnIndex: number,
  pinned?: boolean,
  setPinned?: (pinned: boolean) => void,
  size: { width: number, height: number },
  setWidth: (width: number) => void
}

export function Heading({ column, columnIndex, pinned, setPinned, size, setWidth }: HeadingProps): JSX.Element {
  const onResize = useCallback(throttle((e, { size }) => setWidth(size.width), 5), [])
  const [drag, dragRef, previewRef] = useDrag(() => ({
    type: "column", item: { columnIndex, column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))
  const [drop, dropRef] = useDrop(() => ({
    accept: "column",
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }))
  if (drag.isDragging) {
    return <div ref={previewRef} className="column-heading" />
  }
  return (
    <Resizable
      axis="x"
      width={size.width}
      height={size.height}
      onResize={onResize}
      minConstraints={[100, size.height]}
      resizeHandles={["e"]}
    >
      <div ref={dragRef} className='column-heading' style={size}>
        <div ref={dropRef} className={cx("drop-target", { "is-over": drop.isOver })} />
        <span>{column.id}</span>
        <div className="controls">
          <button
            className={cx("pin-control", { disabled: !pinned })}
            onClick={() => setPinned && setPinned(!pinned)}
          >
            <Icon icon={faThumbtack} />
          </button>
        </div>
      </div>
    </Resizable>
  )
}
import throttle from 'lodash/throttle'
import "./Heading.scss"
import cx from "classnames"
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons/faThumbtack'
import { useCallback } from "react"
import { Resizable } from 'react-resizable'
import { useDrag, useDrop } from 'react-dnd'

type HeadingProps = {
  column: { id: string }
  columnIndex: number,
  pinned?: boolean,
  size: { width: number, height: number },
  onDrop?: (ix: number) => void
  onChangePinned?: (pinned: boolean) => void,
  onResize?: (size: { width: number, height: number }) => void
}

type DnDItem = { columnIndex: number }

export function Heading({
  column,
  columnIndex,
  pinned,
  size,
  onDrop,
  onChangePinned,
  onResize: $onResize
}: HeadingProps): JSX.Element {
  const onResize = useCallback(throttle((e, { size }) => $onResize && $onResize(size), 5), [])
  const [drag, dragRef, previewRef] = useDrag(() => ({
    type: "column", item: { columnIndex } as DnDItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))
  const [drop, dropRef] = useDrop(() => ({
    accept: "column",
    drop: ({ columnIndex: ix }: DnDItem) => onDrop && onDrop(ix),
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
      <div className='column-heading' style={size}>
        <div ref={dragRef}>
          <div ref={dropRef} className={cx("drop-target", { "is-over": drop.isOver })} />
          <span>{column.id}</span>
          <div className="controls">
            <button
              className={cx("pin-control", { disabled: !pinned })}
              onClick={() => onChangePinned && onChangePinned(!pinned)}
            >
              <Icon icon={faThumbtack} />
            </button>
          </div>
        </div>
      </div>
    </Resizable>
  )
}
import { faThumbtack } from "@fortawesome/free-solid-svg-icons/faThumbtack"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"
import cx from "classnames"
import throttle from "lodash/throttle"
import { useCallback } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Resizable } from "react-resizable"

type HeadingCellProps = {
  column: { id: string }
  columnIndex: number,
  isPinned?: boolean,
  size: { width: number, height: number },
  onDrop?: (ix: number) => void
  onChangePinned?: (pinned: boolean) => void,
  onResize?: (size: { width: number, height: number }) => void
}

type DnDItem = { columnIndex: number }

export function HeadingCell({
  column,
  columnIndex,
  isPinned,
  size,
  onDrop,
  onChangePinned,
  onResize: $onResize,
}: HeadingCellProps): JSX.Element {
  const onResize = useCallback(throttle((e, { size }) => $onResize && $onResize(size), 5), [])
  const [drag, dragRef, previewRef] = useDrag(() => ({
    type: "column", item: { columnIndex } as DnDItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))
  const [drop, dropRef] = useDrop(() => ({
    accept: "column",
    drop: ({ columnIndex: ix }: DnDItem) => onDrop && onDrop(ix),
    collect: (monitor) => ({
      isDragging: Boolean(monitor.getItem()),
      isOver: monitor.isOver({ shallow: true }),
    }),
  }))
  if (drag.isDragging) {
    return <div ref={previewRef} className="HeadingCell" />
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
      <div className={cx("HeadingCell", drop)} style={size}>
        <div ref={dragRef} className="dragSource">
          <div ref={dropRef} className="dropTarget" />
          <span className="title">{column.id}</span>
          <div className="controls">
            <button
              className={cx("pinControl", { disabled: !isPinned })}
              onClick={() => onChangePinned && onChangePinned(!isPinned)}
            >
              <Icon icon={faThumbtack} />
            </button>
          </div>
        </div>
      </div>
    </Resizable>
  )
}
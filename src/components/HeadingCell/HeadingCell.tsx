import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown"
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp"
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons/faLayerGroup"
import { faThumbtack } from "@fortawesome/free-solid-svg-icons/faThumbtack"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome"
import cx from "classnames"
import throttle from "lodash/throttle"
import { MouseEvent, useCallback } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Resizable } from "react-resizable"

import { Ordering } from "../../lib/hooks/useOrderBy"

type HeadingCellProps = {
  column: { id: string }
  columnIndex: number
  isPinned?: boolean
  isGrouped?: boolean
  size: { width: number, height: number }
  ordering?: [Ordering, number]
  onDrop?: (ix: number) => void
  onChangePinned?: (pinned: boolean) => void
  onChangeGrouped?: (grouped: boolean) => void
  onChangeOrdering?: (ordering?: Ordering) => void
  onResize?: (size: { width: number, height: number }) => void
}

type DnDItem = { columnIndex: number }

export function HeadingCell({
  column,
  columnIndex,
  isPinned,
  isGrouped,
  size,
  ordering,
  onDrop,
  onChangePinned,
  onChangeGrouped,
  onChangeOrdering,
  onResize: $onResize,
}: HeadingCellProps): JSX.Element {
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

  const onResize = useCallback(throttle((e, { size }) => $onResize?.(size), 5), [])

  const onClick = useCallback((e: MouseEvent) => {
    if (!e.shiftKey) return
    e.preventDefault()
    onChangeOrdering?.({
      "NONE": "ASC" as Ordering,
      "ASC": "DESC" as Ordering,
      "DESC": undefined,
    }[ordering ? ordering[0] : "NONE"])
  }, [ordering])

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
      <div
        className={cx("HeadingCell", drop)}
        style={size}
        onClick={onClick}
      >
        <div ref={dragRef} className="dragSource">
          <div ref={dropRef} className="dropTarget" />
          <div className="toggleControls">
            <button
              className={cx("groupControl", { disabled: !isGrouped })}
              onClick={() => onChangeGrouped?.(!isGrouped)}
            >
              <Icon icon={faLayerGroup} />
            </button>
            <button
              className={cx("pinControl", { disabled: !isPinned })}
              onClick={() => onChangePinned?.(!isPinned)}
            >
              <Icon icon={faThumbtack} />
            </button>
            <button className={cx("ordControl", { isOrdering: Boolean(ordering) })}>
              {ordering?.[0] === "DESC" ? (
                <Icon icon={faArrowUp} />
              ) : ordering?.[0] === "ASC" ? (
                <Icon icon={faArrowDown} />
              ) : null}
              {ordering && <span>{ordering[1]}</span>}
            </button>
          </div>
          <span className="title">{column.id}</span>
        </div>
      </div>
    </Resizable>
  )
}
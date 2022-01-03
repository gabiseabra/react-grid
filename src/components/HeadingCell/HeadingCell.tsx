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

import { Order, Sorting } from "../../lib/Schema"

type HeadingToggleControlsProps = {
  sorting?: Sorting
  isPinned?: boolean
  isGrouped?: boolean
  onChangePinned?: (pinned: boolean) => void
  onChangeGrouped?: (grouped: boolean) => void
}

function HeadingToggleControls({
  sorting,
  isGrouped,
  isPinned,
  onChangeGrouped,
  onChangePinned,
}: HeadingToggleControlsProps): JSX.Element {
  return (
    <div className="toggleControls">
      <div className="space" />
      <button className={cx("ordControl", { disabled: !sorting })}>
        {sorting?.order === "DESC" ? (
          <Icon icon={faArrowUp} />
        ) : sorting?.order === "ASC" ? (
          <Icon icon={faArrowDown} />
        ) : null}
        {sorting && <span>{sorting.priority + 1}</span>}
      </button>
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
    </div>
  )
}

type HeadingCellProps = {
  label: string
  columnIndex: number
  size: { width: number, height: number }
  onDrop?: (ix: number) => void
  onChangeWidth?: (width: number) => void
  onChangeSort?: (ord?: Sorting) => void
} & HeadingToggleControlsProps

type DnDItem = { columnIndex: number }

export function HeadingCell({
  label,
  columnIndex,
  size,
  sorting,
  onDrop,
  onChangeSort,
  onChangeWidth,
  ...props
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

  const onResize = useCallback(throttle((e, { size }) => onChangeWidth?.(size.width), 5), [])

  const onClick = useCallback((e: MouseEvent) => {
    if (!e.shiftKey) return
    e.preventDefault()
    const order = {
      "NONE": "ASC" as Order,
      "ASC": "DESC" as Order,
      "DESC": undefined,
    }[sorting ? sorting.order : "NONE"]
    if (!order) onChangeSort?.()
    else onChangeSort?.({
      order,
      priority: typeof sorting === 'undefined' ? Infinity : sorting.priority,
    })
  }, [sorting])

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
          <HeadingToggleControls sorting={sorting} {...props} />
          <div className="title">
            {label}
          </div>
        </div>
      </div>
    </Resizable>
  )
}
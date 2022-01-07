import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown"
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp"
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons/faLayerGroup"
import { faThumbtack } from "@fortawesome/free-solid-svg-icons/faThumbtack"
import { faFilter } from "@fortawesome/free-solid-svg-icons/faFilter"
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
  hasFilters?: boolean
  onChangePinned?: (pinned: boolean) => void
  onChangeGrouped?: (grouped: boolean) => void
  onClearFilters?: () => void
}

function HeadingToggleControls({
  sorting,
  isGrouped,
  isPinned,
  hasFilters,
  onChangeGrouped,
  onChangePinned,
  onClearFilters,
}: HeadingToggleControlsProps): JSX.Element {
  return (
    <div className="toggleControls">
      <div className="space" />
      {sorting && (
        <button className="ordControl">
          {sorting.order === "DESC" ? (
            <Icon icon={faArrowUp} />
          ) : (
            <Icon icon={faArrowDown} />
          )}
          <span>{sorting.priority + 1}</span>
        </button>
      )}
      {hasFilters && (
        <button className="filterControl" onClick={onClearFilters}>
          <Icon icon={faFilter} />
        </button>
      )}
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
  columnKey: string
  width: number
  height: number
  onDrop?: (columnKey: string) => void
  onChangeWidth?: (width: number) => void
  onChangeSort?: (ord?: Sorting) => void
} & HeadingToggleControlsProps

type DnDItem = { columnKey: string }

export function HeadingCell({
  label,
  columnKey,
  width,
  height,
  sorting,
  onDrop,
  onChangeSort,
  onChangeWidth,
  ...props
}: HeadingCellProps): JSX.Element {
  const [drag, dragRef, previewRef] = useDrag(() => ({
    type: "column",
    item: { columnKey } as DnDItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [columnKey])

  const [drop, dropRef] = useDrop(() => ({
    accept: "column",
    drop: ({ columnKey: key }: DnDItem) => onDrop?.(key),
    collect: (monitor) => ({
      isDragging: Boolean(monitor.getItem()),
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [onDrop])

  const onResize = useCallback(throttle((_e, { size }) =>
    onChangeWidth?.(size.width)
  , 5), [onChangeWidth])

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
      priority: typeof sorting === "undefined" ? Infinity : sorting.priority,
    })
  }, [sorting, onChangeSort])

  if (drag.isDragging) {
    return <div ref={previewRef} className="HeadingCell" />
  }

  return (
    <Resizable
      axis="x"
      width={width}
      height={height}
      onResize={onResize}
      minConstraints={[100, height]}
      resizeHandles={["e"]}
    >
      <div
        className={cx("HeadingCell", drop)}
        style={{ width, height }}
        onClick={onClick}
      >
        <div ref={dragRef} className="dragSource">
          <div ref={dropRef} className="dropTarget" />
          <HeadingToggleControls sorting={sorting} {...props} />
          <div className="label">
            {label}
          </div>
        </div>
      </div>
    </Resizable>
  )
}
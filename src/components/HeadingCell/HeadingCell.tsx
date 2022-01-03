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

import { Sort } from "../../lib/Schema"

type HeadingToggleControlsProps = {
  sort?: [number, Sort]
  isPinned?: boolean
  isGrouped?: boolean
  onChangePinned?: (pinned: boolean) => void
  onChangeGrouped?: (grouped: boolean) => void
}

function HeadingToggleControls({
  sort,
  isGrouped,
  isPinned,
  onChangeGrouped,
  onChangePinned,
}: HeadingToggleControlsProps): JSX.Element {
  return (
    <div className="toggleControls">
      <div className="space" />
      <button className={cx("ordControl", { disabled: !sort })}>
        {sort?.[1] === "DESC" ? (
          <Icon icon={faArrowUp} />
        ) : sort?.[1] === "ASC" ? (
          <Icon icon={faArrowDown} />
        ) : null}
        {sort && <span>{sort[0] + 1}</span>}
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
  column: { id: string, label: string }
  columnIndex: number
  size: { width: number, height: number }
  onDrop?: (ix: number) => void
  onChangeWidth?: (width: number) => void
  onChangeSort?: (ord?: [number, Sort]) => void
} & HeadingToggleControlsProps

type DnDItem = { columnIndex: number }

export function HeadingCell({
  column,
  columnIndex,
  size,
  sort,
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

  const onResize = useCallback(throttle((e, { size }) => onChangeWidth?.(size.width), 5), [column.id])

  const onClick = useCallback((e: MouseEvent) => {
    if (!e.shiftKey) return
    e.preventDefault()
    const ord = {
      "NONE": "ASC" as Sort,
      "ASC": "DESC" as Sort,
      "DESC": undefined,
    }[sort ? sort[1] : "NONE"]
    onChangeSort?.(ord ? [sort ? sort[0] : Infinity, ord] : undefined)
  }, [column.id, sort])

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
          <HeadingToggleControls sort={sort} {...props} />
          <div className="title">
            {column.label}
          </div>
        </div>
      </div>
    </Resizable>
  )
}
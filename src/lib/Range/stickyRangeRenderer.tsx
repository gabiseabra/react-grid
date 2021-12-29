import cx from "classnames"
import { CSSProperties } from "react"

import { RangeRenderer } from "./cellRangeRenderer"

const translate = ({ x, y }: { x?: number, y?: number }): string | undefined => {
  if (x && y) return `translate(${x}px, ${y}px)`
  if (x) return `translateX(${x}px)`
  if (y) return `translateY(${y}px)`
  else return undefined
}

export type StickyRangeOptions = {
  key: string,
  className?: string,
  style?: CSSProperties,
  top?: boolean,
  left?: boolean
}

export const stickyRangeRenderer = ({ key, className, style = {}, top, left }: StickyRangeOptions): RangeRenderer => (cells, {
  bbox: [[minX, minY], [maxX]],
  styleCache,
  columnSizeAndPositionManager,
  rowSizeAndPositionManager,
  horizontalOffsetAdjustment,
  verticalOffsetAdjustment,
}) => {
  if (!styleCache[key]) {
    const marginLeft = left ? columnSizeAndPositionManager.getSizeAndPositionOfCell(minX).offset : undefined
    const marginTop = top ? rowSizeAndPositionManager.getSizeAndPositionOfCell(minY).offset : undefined
    const transform = translate({
      x: marginLeft ? -marginLeft : undefined,
      y: marginTop ? -marginTop : undefined,
    })
    let width = 0
    for (let x = minX; x <= maxX; x++) width += columnSizeAndPositionManager.getSizeAndPositionOfCell(x).size
    styleCache[key] = { width, height: 0, marginLeft, marginTop, transform }
  }
  const offsetAdjustment = translate({
    x: left ? -horizontalOffsetAdjustment : undefined,
    y: top ? -verticalOffsetAdjustment : undefined,
  })
  const transform = [offsetAdjustment, styleCache.transform].filter(Boolean).join(" ")
  return [
    <div
      key={key}
      className={cx(className, { "sticky-top": top, "sticky-left": left })}
      style={{
        ...styleCache[key],
        transform,
        ...style,
      }}
    >
      {cells}
    </div>,
  ]
}
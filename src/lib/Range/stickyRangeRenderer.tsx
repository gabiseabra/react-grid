import cx from 'classnames'
import { CSSProperties } from "react"
import { RangeRenderer } from './cellRangeRenderer'

const translate = ({ x, y }: { x?: number, y?: number }): string | undefined => {
  if (typeof x != "undefined" && typeof y != "undefined") return `translate(${x}px, ${y}px)`
  if (typeof x != "undefined") return `translateX(${x}px)`
  if (typeof y != "undefined") return `translateY(${x}px)`
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
  verticalOffsetAdjustment
}) => {
  if (!styleCache[key]) {
    const marginLeft = left ? columnSizeAndPositionManager.getSizeAndPositionOfCell(minX).offset + horizontalOffsetAdjustment : undefined
    const marginTop = top ? rowSizeAndPositionManager.getSizeAndPositionOfCell(minY).offset + verticalOffsetAdjustment : undefined
    const transform = translate({
      x: marginLeft ? -marginLeft : undefined,
      y: marginTop ? -marginTop : undefined
    })
    let width = 0;
    for (let x = minX; x <= maxX; x++) width += columnSizeAndPositionManager.getSizeAndPositionOfCell(x).size
    styleCache[key] = { width, height: 0, marginLeft, marginTop, transform }
  }
  return [
    <div
      key={key}
      className={cx(className, { "sticky-top": top, "sticky-left": left })}
      style={{ ...style, ...styleCache[key] }}
    >
      {cells}
    </div>
  ]
}
import * as RV from 'react-virtualized'
import { ReactNode } from "react";
import { Endo } from '../fp'
import { Range, all, Cell, intersects } from './BBox';

export type CellRenderer = (props: RV.GridCellProps) => ReactNode

export const mkCellRenderer = (...$ranges: [Endo<Range>, CellRenderer][]): RV.GridCellRenderer => {
  const ranges: [Range, CellRenderer][] = $ranges.map(([fn, g]) => [fn(all), g])
  return (props) => {
    const cell = Cell(props)
    const match = ranges.find(([range]) => intersects([cell, cell])(range))
    if (match) return match[1](props)
    return null
  }
}

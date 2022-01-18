import "./styles.scss"

import pipe from "lodash/fp/pipe"
import { RefObject, useEffect, useMemo, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import * as RV from "react-virtualized"

import * as CM from "./components/ContextMenu"
import { Filter } from "./components/Filter"
import { GroupCell } from "./components/GroupCell"
import { HeadingCell } from "./components/HeadingCell"
import { ValueCell } from "./components/ValueCell"
import { adjustScrollToCell } from "./lib/adjustScrollToCell"
import { Columns, Rows } from "./lib/Dataset"
import { isGroup } from "./lib/Group"
import { usePreset } from "./lib/hooks/usePreset"
import { useQuery } from "./lib/hooks/useQuery"
import { useSelection } from "./lib/hooks/useSelection"
import {
  mkCellRangeRenderer,
  mkCellRenderer,
  Point,
  rowRange,
  stickyRangeRenderer,
} from "./lib/Range"
import { emptyQuery, Preset, TypeName, TypeOf } from "./lib/Schema"

const headingRange = rowRange(0)

const HEADER_HEIGHT = 70

export const initialPreset: Preset = {
  columns: Columns,
  query: emptyQuery,
  pinCount: 0,
}

export default function App(): JSX.Element {
  const gridRef: RefObject<RV.Grid> = useRef(null)

  const {
    preset: { columns, pinCount, query },
    pinnedRange,
    ...preset
  } = usePreset(initialPreset)

  const res = useQuery(query)

  const selection = useSelection({
    selectableRange: [[0, 1], [columns.size, res.result.length + 1]],
    scrollToCell: adjustScrollToCell({
      gridRef,
      offset: { columnIndex: pinCount, rowIndex: 1 },
    }),
  }, [columns.size, res.result.length])

  useEffect(() => gridRef.current?.recomputeGridSize(), [columns])
  useEffect(() => selection.clearSelection(), [columns.size, res.result.length])

  const cellRenderer = useMemo(() => mkCellRenderer(
    [headingRange, ({ columnIndex: index, style }) => {
      const column = columns.iget(index)!
      const colKey = columns.key(index)!
      return (
        <div key={colKey} style={style}>
          <CM.Context
            renderMenu={(ref, style) => (
              <CM.Menu ref={ref} style={style}>
                <CM.SubMenu id="filters" label="Filter">
                  <Filter<unknown>
                    id={column.id}
                    type={column.type}
                    format={column.format}
                    filter={preset.getFilter(column.id)}
                    onChange={preset.setFilter(column.id)}
                    getPossibleValues={() => new Set(Rows.map((r) => r[column.id] as any))}
                  />
                </CM.SubMenu>
                <CM.Button onClick={() => {
                  preset.insertColumn(
                    String(Date.now()),
                    {...column},
                    index + 1
                  )
                }}>
                  Duplicate
                </CM.Button>
                <CM.Confirm onConfirmed={() => preset.deleteColumn(colKey)}>
                  {(onClick, state) =>
                    <CM.Button onClick={onClick}>
                      {state === "CONFIRM" ? "Really?" : "Delete"}
                    </CM.Button>
                  }
                </CM.Confirm>
                <CM.SubMenu id="test" label="Testing">
                  <CM.Button onClick={() => console.log("lmao")}>Eyy</CM.Button>
                  <CM.SubMenu id="eyy" label="Eyy">lmao</CM.SubMenu>
                </CM.SubMenu>
              </CM.Menu>
            )}
          >
            <HeadingCell
              label={column.label}
              columnKey={colKey}
              width={column.width}
              height={HEADER_HEIGHT}
              isPinned={preset.isPinned(colKey)}
              sorting={preset.getSorting(column.id)}
              isGrouped={preset.isGrouped(column.id)}
              hasFilters={Boolean(preset.getFilter(column.id))}
              onClearFilters={preset.setFilter(column.id)}
              onChangeGrouped={preset.setGrouped(column.id)}
              onChangeSort={preset.setSorting(column.id)}
              onChangePinned={preset.setPinned(colKey)}
              onChangeWidth={preset.setWidth(colKey)}
              onDrop={($key) => preset.moveColumn($key, index)}
            />
          </CM.Context>
        </div>
      )
    }],
    [x => x, ({ columnIndex, rowIndex, style }) => {
      const column = columns.iget(columnIndex)!
      const colKey = columns.key(columnIndex)!
      const row = res.result[rowIndex - 1]
      if (isGroup(row)) {
        const key = `${colKey}:g:${row.key}`
        const isExpanded = res.isExpanded(row.key)
        return (
          <div key={key} style={style} onClick={() => res.setExpanded(row.key)(!isExpanded)}>
            <GroupCell
              type={column.type}
              values={row.entries.map(row => row[column.id] as any)}
              isExpanded={isExpanded}
              columnIndex={columnIndex}
            />
          </div>
        )
      } else {
        const value = row[column.id] as TypeOf<TypeName>
        const coord = Point({ columnIndex, rowIndex })
        const key = `${colKey}:r:${rowIndex}`
        return (
          <div key={key} style={style} {...selection.cellEvents(coord)}>
            <ValueCell<unknown>
              type={column.type}
              value={value}
              isFocused={selection.isFocused(coord)}
              isSelected={selection.isSelected(coord)}
            />
          </div>
        )
      }
    }]
  ), [
    pinCount,
    selection.selection,
    selection.isSelecting,
    res.result,
    columns,
    query,
  ])

  const cellRangeRenderer = useMemo(() => mkCellRangeRenderer(
    [pipe(pinnedRange, headingRange), stickyRangeRenderer({
      key: "pinned-heading",
      top: true,
      left: true,
    })],
    [headingRange, stickyRangeRenderer({ key: "heading", top: true })],
    [pinnedRange, stickyRangeRenderer({ key: "pinned", left: true })],
    [x => x, x => x]
  ), [pinCount])

  return (
    <DndProvider backend={HTML5Backend}>
      <RV.AutoSizer>
        {({ width, height }) => (
          <RV.Grid
            ref={gridRef}
            width={width}
            height={height}
            overscanColumnCount={0}
            overscanRowCount={0}
            cellRangeRenderer={cellRangeRenderer}
            cellRenderer={cellRenderer}
            columnCount={columns.size}
            rowCount={res.result.length + 1}
            columnWidth={({ index }) => columns.iget(index)!.width}
            rowHeight={({ index }) => index === 0 ? HEADER_HEIGHT : 30}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  )
}

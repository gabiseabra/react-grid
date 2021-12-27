import "./styles.scss";
import pipe from 'lodash/fp/pipe'
import { Ref, useMemo, useRef, useState } from "react";
import * as RV from 'react-virtualized'
import * as T from "./lib/Table";
import { tableRenderer } from "./lib/tableRenderer";
import { renderRanges, rowIndexRange } from "./lib/multiRangeRenderer";
import { CellValue, CellTypes } from "./Types";
import { arbitraryValue } from "./Types/arbitrary";
import { stickyRange } from "./lib/stickyRange";
import { Heading } from "./Heading";
import { useTableLayout } from "./lib/useTableLayout";
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { useColumnPosition } from "./lib/useColumnPosition";

const Columns = {
  db_string0: { type: "string" },
  db_string1: { type: "string" },
  db_string2: { type: "string" },
  db_string3: { type: "string" },
  db_string4: { type: "string" },
  db_string5: { type: "string" },
  db_string6: { type: "string" },
  db_string7: { type: "string" },
  db_string8: { type: "string" },
  db_string9: { type: "string" },
  db_number0: { type: "number" },
  db_number1: { type: "number" },
  db_number2: { type: "number" },
  db_number3: { type: "number" },
  db_number4: { type: "number" },
  db_number5: { type: "number" },
  db_number6: { type: "number" },
  db_number7: { type: "number" },
  db_number8: { type: "number" },
  db_number9: { type: "number" },
  db_boolean0: { type: "boolean" },
  db_boolean2: { type: "boolean" },
  db_boolean3: { type: "boolean" },
  db_boolean4: { type: "boolean" },
  db_boolean5: { type: "boolean" },
  db_boolean6: { type: "boolean" },
  db_boolean7: { type: "boolean" },
  db_boolean8: { type: "boolean" },
  db_boolean9: { type: "boolean" },
  db_date0: { type: "date" },
  db_date1: { type: "date" },
  db_date2: { type: "date" },
  db_date3: { type: "date" },
  db_date4: { type: "date" },
  db_date5: { type: "date" },
  db_date6: { type: "date" },
  db_date7: { type: "date" },
  db_date8: { type: "date" },
  db_date9: { type: "date" },
} as const

type ColT = T.ColT<typeof Columns, CellTypes>
type RowT = T.RowT<typeof Columns, CellTypes>

const mkRow = (i: number): RowT => columns.reduce((acc, { id, type }) => ({
  [id]: arbitraryValue(type, i),
  ...acc
}), {}) as RowT

const columns: ColT[] = Object.entries(Columns).map(([id, col]) => ({ id, ...col }) as ColT)

const rows: RowT[] = Array(1000).fill(null).map((_, i) => mkRow(i))

export default function App(): JSX.Element {
  const gridRef: Ref<RV.Grid> = useRef(null)
  const [table, setTable] = useState({ columns, rows })
  const { getWidth, setWidth, layoutProps } = useTableLayout({
    gridRef,
    table,
    cellSize: { width: 130, height: 30 },
    headingSize: { width: 50, height: 50 }
  })
  const {
    pinCount,
    isPinned,
    addPin,
    removePin,
    pinnedRange
  } = useColumnPosition((fn) => setTable(({ columns, rows }) => ({ columns: fn(columns), rows })))
  const cellRenderer = useMemo(() => tableRenderer(table, ({ cell, ...props }) => {
    switch (cell.kind) {
      case "cell":
        return (
          <div key={props.key} style={props.style}>
            <CellValue readOnly cell={T.getCell(cell.column.value, cell.row.value)} />
          </div>
        )
      case "column":
        const index = cell.column.index
        const column = cell.column.value
        return (
          <div key={props.key} style={props.style}>
            <Heading
              column={column}
              columnIndex={index}
              pinned={isPinned(index)}
              setPinned={(pinned) => pinned ? addPin(index) : removePin(index)}
              size={{ width: getWidth(index), height: 50 }}
              setWidth={(width) => setWidth(index, width)}
            />
          </div>
        )
      case "row": return <div key={props.key} style={props.style}>{cell.row.index}</div>
      default: return null
    }
  }), [table])
  const cellRangeRenderer = useMemo(() => renderRanges(
    pipe(
      pinnedRange,
      rowIndexRange(0),
      stickyRange({ key: "pinned-heading", top: true, left: true, style: { zIndex: 2 } })
    ),
    pipe(
      rowIndexRange(0),
      stickyRange({ key: "heading", top: true })
    ),
    pipe(
      pinnedRange,
      stickyRange({ key: "pinned", left: true })
    ),
    x => x
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
            {...layoutProps}
          />
        )}
      </RV.AutoSizer>
    </DndProvider>
  );
}

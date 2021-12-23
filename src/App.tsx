import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { Grid, CellValue } from "./Grid";
import { Header } from "./Grid/Header";
import compose from "./lib/compose";
import { hoc, withProps } from "./lib/hoc";
import "./styles.css";

const numColumns = 100;
const numRows = 500;

const initialColumns = Array(numColumns)
  .fill(null)
  .map((_, i) => ({
    id: String(i),
    label: `C${i}`,
    width: 100
  }));
const data = Array(numRows)
  .fill(null)
  .map((_, i) =>
    initialColumns.reduce(
      (acc, { id }, j) => ({
        [id]: CellValue(`${i},${j}`),
        ...acc
      }),
      {}
    )
  );

export default function App() {
  return (
    <AutoSizer>
      {({ width, height }) => (
        <Header style={{ width }} initialColumns={initialColumns}>
          {({ columns }) => (
            <Grid
              readOnly
              columns={columns}
              data={data}
              width={width}
              height={height}
              columnWidth={100}
              rowHeight={20}
            />
          )}
        </Header>
      )}
    </AutoSizer>
  );
}

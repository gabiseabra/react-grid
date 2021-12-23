import "./styles.scss";
import React, { useRef } from "react";
import useComponentSize from '@rehooks/component-size'
import { mkCellValue } from "./Grid";
import * as Grid from "./Grid";
import { ReactWindowScroller } from "./lib/WindowScroller";

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
        [id]: mkCellValue(`${i},${j}`),
        ...acc
      }),
      {}
    )
  );

export default function App() {
  const scrollRef: React.Ref<HTMLDivElement> = useRef(null)
  const { width, height } = useComponentSize(scrollRef)
  return (
    <div ref={scrollRef} className="scroller">
      {/* @ts-ignore */}
      <ReactWindowScroller isGrid scrollElementRef={scrollRef.current}>
        {({ ref, outerRef, style, onScroll }: any) => (
          <Grid.Header initialColumns={initialColumns}>
            {({ columns }) => (
              <Grid.Body
                readOnly
                columns={columns}
                data={data}
                width={width - 16}
                height={height}
                columnWidth={100}
                rowHeight={20}
                innerRef={ref}
                outerRef={outerRef}
                style={style}
                onScroll={onScroll}
              />
            )}
          </Grid.Header>
        )}
      </ReactWindowScroller>
    </div>
  );
}

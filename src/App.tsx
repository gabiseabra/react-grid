import "./styles.scss";
import * as Cell from "./Cell";
import * as Grid from "./Grid";

const numColumns = 100;
const numRows = 500;

const initialColumns = Array(numColumns)
  .fill(null)
  .map((_, i) => ({
    id: String(i),
    label: `C${i}`,
    width: 100
  }));
const rows = Array(numRows)
  .fill(null)
  .map((_, i) =>
    initialColumns.reduce(
      (acc, { id }, j) => ({
        [id]: Cell.Value(`${i},${j}`),
        ...acc
      }),
      {}
    )
  );

export default function App(): JSX.Element {
  return (
    <Grid.Container>
      {({ width, height }) => (
        <Grid.Body
          data={null}
          columns={initialColumns}
          rows={rows}
          width={width}
          height={height - 30}
          columnWidth={100}
          rowHeight={20}
          renderCol={Cell.ColComponent}
          renderRow={Cell.RowComponent}
        />
      )}
    </Grid.Container>
  );
}

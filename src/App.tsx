import "./styles.scss";
import { mkCellValue } from "./Grid";
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
  return (
    <Grid.Container>
      {(containerProps) => (
        // <Grid.Header initialColumns={initialColumns}>
        //   {(headerProps) => (
        <Grid.Body
          readOnly
          data={data}
          columnWidth={100}
          rowHeight={20}
          {...containerProps}
          columns={initialColumns}
        // {...headerProps}
        />
        //   )}
        // </Grid.Header>
      )}
    </Grid.Container>
  );
}

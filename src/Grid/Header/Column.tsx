export type Column = {
  id: string;
  width: number;
  label: string;
};

function Controls({}) {
  return null;
}

export function HeaderCell({ width, label }: Column): JSX.Element {
  return (
    <div className="grid-header-cell" style={{ width }}>
      <span className="grid-header-cell-label">{label}</span>
      <span className="grid-header-cell-controls">
        <Controls />
      </span>
    </div>
  );
}

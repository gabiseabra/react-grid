type NumberCellProps = {
  value?: number;
  readOnly: boolean;
};

export function NumberCell({ value, readOnly }: NumberCellProps): JSX.Element {
  return <input type="number" value={String(value || 0)} readOnly={readOnly} />;
}

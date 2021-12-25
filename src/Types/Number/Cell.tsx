type NumberCellProps = {
  value: number | null;
  readOnly?: boolean;
  onChange?: (value: number | null) => any
};

const parseNumber = (value: string): number | null => {
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

export function NumberCell({ value, readOnly, onChange }: NumberCellProps): JSX.Element {
  return (
    <input
      type="number"
      value={String(value || 0)}
      readOnly={readOnly}
      onChange={!onChange ? undefined : (e) => onChange(parseNumber(e.target.value))}
    />
  );
}

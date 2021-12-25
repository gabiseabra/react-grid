type StringCellProps = {
  value: string | null;
  readOnly?: boolean;
  onChange?: (value: string | null) => any
};

const parseString = (value: string): string | null => value === "" ? null : value

export function StringCell({ value, readOnly, onChange }: StringCellProps): JSX.Element {
  return (
    <input
      type="text"
      value={value || ""}
      readOnly={readOnly}
      onChange={!onChange ? undefined : (e) => onChange(parseString(e.target.value))}
    />
  );
}

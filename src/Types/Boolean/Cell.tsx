type BoolCellProps = {
  value: boolean | null;
  readOnly?: boolean;
  onChange?: (value: boolean | null) => any
};

export function BoolCell({ value, readOnly, onChange }: BoolCellProps): JSX.Element {
  return (
    <input
      type="checkbox"
      checked={Boolean(value)}
      readOnly={readOnly}
      onChange={!onChange ? undefined : (e) => onChange(e.target.checked)
      }
    />
  );
}

type DateCellProps = {
  value: Date | null;
  readOnly?: boolean;
  onChange?: (value: Date | null) => any
};

export function DateCell({ value, readOnly, onChange }: DateCellProps): JSX.Element {
  return (
    <input
      type="date"
      value={value?.toISOString().split('T')[0] || ""}
      readOnly={readOnly}
      onChange={!onChange ? undefined : (e) => onChange(e.target.valueAsDate)}
    />
  );
}

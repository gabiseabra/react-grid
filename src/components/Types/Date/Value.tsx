type DateValueProps = {
  value: Date | null;
  onChange?: (value: Date | null) => any
  readOnly?: boolean;
  className?: string;
};

export function DateValue({ value, onChange, ...props }: DateValueProps): JSX.Element {
  return (
    <input
      type="date"
      value={value?.toISOString().split('T')[0] || ""}
      onChange={!onChange ? undefined : (e) => onChange(e.target.valueAsDate)}
      {...props}
    />
  );
}

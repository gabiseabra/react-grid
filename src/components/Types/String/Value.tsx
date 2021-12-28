type StringValueProps = {
  value: string | null;
  onChange?: (value: string | null) => any
  readOnly?: boolean;
  className?: string;
};

const parseString = (value: string): string | null => value === "" ? null : value

export function StringValue({ value, onChange, ...props }: StringValueProps): JSX.Element {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={!onChange ? undefined : (e) => onChange(parseString(e.target.value))}
      {...props}
    />
  );
}

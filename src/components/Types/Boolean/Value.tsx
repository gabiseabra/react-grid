type BoolValueProps = {
  value: boolean | null;
  onChange?: (value: boolean | null) => any
  readOnly?: boolean;
  className?: string;
};

export function BoolValue({ value, onChange, ...props }: BoolValueProps): JSX.Element {
  return (
    <input
      type="checkbox"
      checked={Boolean(value)}
      onChange={!onChange ? undefined : (e) => onChange(e.target.checked)}
      {...props}
    />
  );
}

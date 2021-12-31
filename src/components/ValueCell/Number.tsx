type NumberValueProps = {
  value: number | null;
  onChange?: (value: number | null) => any
  readOnly?: boolean;
  className?: string;
};

const parseNumber = (value: string): number | null => {
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

export function NumberValue({ value, onChange, ...props }: NumberValueProps): JSX.Element {
  return (
    <input
      type="number"
      step="1"
      value={String(value || 0)}
      onChange={!onChange ? undefined : (e) => onChange(parseNumber(e.target.value))}
      {...props}
    />
  )
}

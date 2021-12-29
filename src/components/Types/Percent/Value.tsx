type PercentValueProps = {
  value: number | null;
  onChange?: (value: number | null) => any
  readOnly?: boolean;
  className?: string;
};

const parseNumber = (value: string): number | null => {
  const num = parseInt(value)
  return isNaN(num) ? null : Math.max(0, Math.min(1, num))
}

export function PercentValue({ value, onChange, ...props }: PercentValueProps): JSX.Element {
  return (
    <input
      type="number"
      step="0.01"
      value={String(value || 0)}
      onChange={!onChange ? undefined : (e) => onChange(parseNumber(e.target.value))}
      {...props}
    />
  )
}

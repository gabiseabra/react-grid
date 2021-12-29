import { Big } from "big.js"

type PercentValueProps = {
  value: Big | null;
  onChange?: (value: Big | null) => any
  readOnly?: boolean;
  className?: string;
};

const parseBig = (value: string): Big | null => {
  const num = parseInt(value)
  return isNaN(num) ? null : new Big(Math.max(0, Math.min(1, num)))
}

export function PercentValue({ value, onChange, ...props }: PercentValueProps): JSX.Element {
  return (
    <input
      type="number"
      step="0.01"
      value={String(value?.toPrecision(2) || 0)}
      onChange={!onChange ? undefined : (e) => onChange(parseBig(e.target.value))}
      {...props}
    />
  )
}

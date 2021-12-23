type BoolCellProps = {
  value?: boolean;
  readOnly: boolean;
};

export function BoolCell({ value, readOnly }: BoolCellProps): JSX.Element {
  return <input type="checkbox" checked={value} readOnly={readOnly} />;
}

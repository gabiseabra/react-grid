type EnumCellProps = {
  value?: string;
  readOnly: boolean;
};

export function EnumCell({ value, readOnly }: EnumCellProps): JSX.Element {
  return <input type="text" value={value} readOnly={readOnly} />;
}

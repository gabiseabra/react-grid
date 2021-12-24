type DateCellProps = {
  value?: Date;
  readOnly: boolean;
};

export function DateCell({ value, readOnly }: DateCellProps): JSX.Element {
  return <input type="date" value={value?.toISOString().split('T')[0]} readOnly={readOnly} />;
}

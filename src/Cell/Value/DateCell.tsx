type DateCellProps = {
  value?: Date;
  readOnly: boolean;
};

export function DateCell({ value, readOnly }: DateCellProps): JSX.Element {
  return <input type="date" value={value?.toISOString()} readOnly={readOnly} />;
}

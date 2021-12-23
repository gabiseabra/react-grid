import "./Header.scss";
import { useMemo, useState } from "react";
import { Column, HeaderCell } from "./Column";

export type RenderHeaderProps = { columns: Column[]; columnWidth: number };

export type HeaderProps = {
  initialColumns: Column[];
  children: (props: RenderHeaderProps) => JSX.Element;
};

export function Header({
  initialColumns,
  children: render
}: HeaderProps): JSX.Element {
  const [columns, setColumns] = useState(initialColumns);
  const width = useMemo(() => columns.reduce((acc, { width }) => acc + width, 0), [columns])
  return (
    <>
      <div className="grid-header" style={{ width }}>
        {columns.map((cell) => (
          <HeaderCell key={cell.id} {...cell} />
        ))}
      </div>
      {render({ columns, columnWidth: 0 })}
    </>
  );
}

import "./Header.scss";
import React, { useState } from "react";
import { Column, HeaderCell } from "./Column";

export type RenderHeaderProps = { columns: Column[]; columnWidth: number };

export type HeaderProps = {
  initialColumns: Column[];
  style?: React.CSSProperties;
  children: (props: RenderHeaderProps) => JSX.Element;
};

export function Header({
  initialColumns,
  style,
  children: render
}: HeaderProps): JSX.Element {
  const [columns, setColumns] = useState(initialColumns);
  return (
    <>
      <div className="grid-header" style={style}>
        {columns.map((cell) => (
          <HeaderCell key={cell.id} {...cell} />
        ))}
      </div>
      {render({ columns, columnWidth: 0 })}
    </>
  );
}

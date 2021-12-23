import './Col.scss'
import { Col, ColProps } from "../../Grid";

export enum Ordering { ASC, DESC }

export type Header = {
  label: string;
  ordering?: Ordering;
} & Col;

function Controls({ }) {
  return null;
}

export function ColComponent({ value: { label }, style }: ColProps<Header>): JSX.Element {
  return (
    <div className="grid-cell-col" style={style}>
      <span className="grid-cell-col-label">{label}</span>
      <span className="grid-cell-col-controls">
        <Controls />
      </span>
    </div>
  );
}

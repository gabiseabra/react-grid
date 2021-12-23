// @ts-ignore
import * as _ from "lodash";
import {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useMemo
} from "react";

export type CellEvent<T, E> = {
  event: E;
  value: T;
  columnName: string;
  columnIndex: number;
  rowIndex: number;
};

export type CellEvents<T> = {
  onClick?: CellEvent<T, MouseEventHandler<HTMLElement>>;
  onFocus?: CellEvent<T, FocusEventHandler<HTMLElement>>;
  onBlur?: CellEvent<T, FocusEventHandler<HTMLElement>>;
  onKeyPress?: CellEvent<T, KeyboardEventHandler<HTMLElement>>;
};

export type HTMLEvents = {
  onClick?: MouseEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onKeyPress?: KeyboardEventHandler<HTMLElement>;
};

function mkCellEvent<T, E>(data: Omit<CellEvent<T, E>, "event">) {
  return (fn: (event: CellEvent<T, E>) => any) => (event: E): any =>
    fn({ event, ...data });
}

export function useCellEvents<T>(
  events: CellEvents<T>,
  data: Omit<CellEvent<T, any>, "event">
): HTMLEvents {
  return useMemo(() => _.mapValues(events, mkCellEvent(data)), [
    events.onClick,
    events.onFocus,
    events.onBlur,
    events.onKeyPress
  ]);
}

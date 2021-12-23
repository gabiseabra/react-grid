import './Container.scss'
import React, { useRef } from 'react'
import cx from 'classnames/bind';
import useComponentSize from '@rehooks/component-size';

export type RenderContainerProps = {
  width: number,
  height: number,
}

export type ContainerProps = {
  className?: string,
  style?: React.CSSProperties,
  children: (props: RenderContainerProps) => JSX.Element
}

export function Container({ className, style, children }: ContainerProps): JSX.Element {
  const scrollRef: React.Ref<HTMLDivElement> = useRef(null)
  const { width, height } = useComponentSize(scrollRef)

  return (
    <div ref={scrollRef} style={style} className={cx('grid-container', className)}>
      {children({ width, height })}
    </div>
  )
}

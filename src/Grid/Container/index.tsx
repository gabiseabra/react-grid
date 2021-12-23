import './Container.scss'
import React, { useRef, useEffect, useCallback } from 'react'
// @ts-ignore
import throttle from 'lodash/throttle'
import cx from 'classnames/bind';
import { GridOnScrollProps } from 'react-window'
import { BodyInnerRef, BodyOuterRef } from '..'
import useComponentSize from '@rehooks/component-size';

export type RenderContainerProps = {
  width: number,
  height: number,
  style: React.CSSProperties,
  innerRef: BodyInnerRef,
  outerRef: BodyOuterRef,
  onScroll: (props: GridOnScrollProps) => any
}

export type ContainerProps = {
  className?: string,
  style?: React.CSSProperties,
  children: (props: RenderContainerProps) => JSX.Element
}

const THROTTLE_TIME = 10

// Adapted from https://github.com/jnrcorp/react-window-scroller
export function Container({ className, style, children }: ContainerProps): JSX.Element {
  const scrollRef: React.Ref<HTMLDivElement> = useRef(null)
  const innerRef: BodyInnerRef = useRef(null)
  const outerRef: BodyOuterRef = useRef(null)
  const { width, height } = useComponentSize(scrollRef)

  useEffect(() => {
    if (!scrollRef.current) return () => null

    const listener = throttle(() => {
      if (!innerRef.current || !outerRef.current || !scrollRef.current) return
      const scrollTop = scrollRef.current.scrollTop - outerRef.current.offsetTop
      const scrollLeft = scrollRef.current.scrollLeft - outerRef.current.offsetLeft
      innerRef.current.scrollTo({ scrollLeft, scrollTop })
    }, THROTTLE_TIME)

    scrollRef.current.addEventListener('scroll', listener)

    return () => {
      listener.cancel()
      if (scrollRef.current)
        scrollRef.current.removeEventListener('scroll', listener)
    }
  }, [])

  const onScroll = useCallback(
    ({
      scrollLeft = 0, // This is not provided by react-window
      scrollTop = 0, // This is not provided by react-window
      scrollOffset,
      scrollUpdateWasRequested
    }) => {
      if (!scrollUpdateWasRequested || !scrollRef.current || !innerRef.current || !outerRef.current) return
      const top = scrollRef.current.scrollTop
      const left = scrollRef.current.scrollLeft
      scrollOffset += Math.min(top, outerRef.current.offsetTop)
      scrollTop += Math.min(top, outerRef.current.offsetTop)
      scrollLeft += Math.min(left, outerRef.current.offsetLeft)

      if (scrollTop !== top || scrollLeft !== left)
        scrollRef.current.scrollTo(scrollLeft, scrollTop)
    }, [])

  return (
    <div ref={scrollRef} style={style} className={cx('grid-container', className)}>
      {children({
        width,
        height,
        style: { width: "auto", height: "100%", display: "inline-block" },
        innerRef,
        outerRef,
        onScroll
      })}
    </div>
  )
}

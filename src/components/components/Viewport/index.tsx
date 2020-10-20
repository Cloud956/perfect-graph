import { PixiComponent, useApp } from '@inlet/react-pixi'
import * as R from 'unitx/ramda'
import { Viewport } from 'pixi-viewport'
import * as PIXI from 'pixi.js'
import React from 'react'
import { wrapComponent } from 'unitx-ui'
import { ForwardRef, Position } from 'unitx-ui/type'

type NativeViewportProps = {
  app: PIXI.Application;
  width: number;
  height: number;
  onCreate?: (v: Viewport) => void;
  onPress?: (c: {
    nativeEvent: PIXI.InteractionEvent;
    position: Position;
  }) => void|undefined;
  zoom?: number;
  transform?: {
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    skewX?: number;
    skewY?: number;
    pivotX?: number;
    pivotY?: number;
  };

}
type ViewportType = Viewport & {clickEvent: any; isClick: boolean}
const ReactViewportComp = PixiComponent('Viewport', {
  create: (props: NativeViewportProps) => {
    const {
      app: {
        renderer,
        ticker,
      },
      height,
      width,
      onCreate,
    } = props
    const viewport: ViewportType = new Viewport({
      screenWidth: width,
      screenHeight: height,
      worldWidth: width,
      worldHeight: height,
      ticker,
      interaction: renderer.plugins.interaction,
      passiveWheel: false,
    }) as ViewportType
    /* eslint-disable functional/immutable-data, functional/no-expression-statement */
    onCreate?.(viewport)
    viewport.sortableChildren = true
    viewport
      .drag()
      .pinch()
      .wheel()
    // to avoid dragging when onClick child
    viewport.on(
      'pointerdown',
      (e) => {
        R.when(
          R.propNotEq('target', viewport),
          () => viewport.plugins.pause('drag'),
        )(e)
        // const { x, y } = viewport.toWorld(e.data.global)
        viewport.isClick = true
        setTimeout(() => {
          viewport.isClick = false
        }, 250)
      },
    )
    viewport.on('pointerup', () => {
      viewport.plugins.resume('drag')
    })
    viewport.on('wheel', (data) => {
      // @ts-ignore
      data.event.preventDefault()
    })
    /* eslint-enable functional/immutable-data, functional/no-expression-statement */
    return viewport
  },
  applyProps: (
    mutableViewport: ViewportType,
    oldProps,
    newProps,
  ) => {
    const {
      transform,
      onPress,
      zoom,
      width,
      height,
    } = newProps
    mutableViewport.resize(width, height)
    mutableViewport.removeListener('click', mutableViewport.clickEvent)
    mutableViewport.clickEvent = (e: PIXI.InteractionEvent) => R.ifElse(
      R.equals(e.target),
      () => {
        const { x, y } = mutableViewport.toWorld(e.data.global)
        return R.when(
          R.isTrue,
          () => onPress?.({ nativeEvent: e, position: { x, y } }),
        )(mutableViewport.isClick)
      },
      R.identity,
    )(e.currentTarget)
    /* eslint-disable functional/immutable-data, functional/no-expression-statement */
    R.unless(
      R.equals(oldProps.zoom),
      () => mutableViewport.setZoom(zoom ?? 1, true),
    )(zoom)
    R.unless(
      R.equals(oldProps.transform),
      () => mutableViewport.setTransform(
        transform?.x,
        transform?.y,
        transform?.scaleX,
        transform?.scaleY,
        transform?.rotation,
        transform?.skewX,
        transform?.skewY,
        transform?.pivotX,
        transform?.pivotY,
      ),
    )(transform)
    /* eslint-enable functional/immutable-data, functional/no-expression-statement */
    return mutableViewport.on('click', mutableViewport.clickEvent)
  },
  didMount: () => {
  },
  willUnmount: () => {
  },
})

export type ViewportProps = {
  children?: React.ReactNode;
} & Omit<NativeViewportProps, 'app'>

function ViewPortElement(props: ViewportProps, ref: ForwardRef<typeof ViewPortElement>) {
  const {
    children,
    ...rest
  } = props
  const app = useApp()
  return (
    <ReactViewportComp
      ref={ref}
      app={app}
      {...rest}
    >
      {children}
    </ReactViewportComp>
  )
}

const PreparedComponent = wrapComponent<ViewportProps>(
  ViewPortElement, {
    isForwardRef: true,
  },
)

export default PreparedComponent

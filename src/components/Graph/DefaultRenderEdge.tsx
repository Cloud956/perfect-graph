import { RenderEdge } from '@type'
import { cyUnselectAll } from '@utils'
import React from 'react'
import { Text as GraphText } from '../Text'
import { View as GraphView } from '../View'

/**
 * Default render edge component. If renderEdge is not suplied, it will render.
 */
export const DefaultRenderEdge: RenderEdge = ({
  cy,
  element,
  config,
}) => {
  const {
    view: {
      labelVisible,
    },
  } = config
  
  return (
  <GraphView
    pointertap={() => {
      cyUnselectAll(cy)
      element.select()
    }}
  >
    {
      labelVisible && (
        <GraphText
          // isSprite
          // text={R.last(item.id.split('/'))?.substring(0, 10) ?? item.id}
          text={'Heyy'}
        />
      )
    }
  </GraphView>
  )
}

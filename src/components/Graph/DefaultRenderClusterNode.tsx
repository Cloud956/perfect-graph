import { RenderNode } from '@type'
import { cyUnselectAll } from '@utils'
import * as R from 'colay/ramda'
import React from 'react'
import { Text as GraphText } from '../Text'
import { View as GraphView } from '../View'

export const DefaultRenderClusterNode: RenderNode = ({
  item, element, cy, theme,
}) => {
  const hasSelectedEdge = element.connectedEdges(':selected').length > 0
  return (
    <GraphView
      style={{
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        backgroundColor: hasSelectedEdge
          ? theme.palette.secondary.main
          : (element.selected()
            ? theme.palette.primary.main
            : theme.palette.warning.main),
        borderRadius: 20,
      }}
      interactive
      click={() => {
        cyUnselectAll(cy)
        element.select()
      }}
      // rightclick={(e) => {
        // alert('Heyy')
      // }}
      // onRightPress={(e) => {
      // }}
      // mouseover={(e) => {
      // }}
      // onPressEnd={(e) => {
      // }}
    >
      <GraphText
        style={{
          position: 'absolute',
          top: -90,
          color: 'black',
        }}
        isSprite
      >
        {R.last(item.id.split('/'))?.substring(0, 10) ?? item.id}
      </GraphText>
    </GraphView>
  )
}

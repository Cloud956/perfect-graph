import {
  DefaultRenderEdge,
  DefaultRenderNode, Graph, GraphProps,
} from '@components'
import {
  EventInfo,
  GraphConfig,
  GraphLabelData,
  EditorMode,
  RenderEdge,
  RenderNode,
  Element,
  GraphEditorRef,
} from '@type'
import { getLabel, getSelectedItemByElement } from '@utils'
import { EDITOR_MODE, EVENT } from '@utils/constants'
import React from 'react'
import { View, wrapComponent, useForwardRef } from 'unitx-ui'
import { ForwardRef, Position, PropsWithRef } from 'unitx-ui/type'
import * as R from 'unitx/ramda'
import ActionBar, { ActionBarProps } from './ActionBar'
import DataBar, { DataBarProps } from './DataBar'
import SettingsBar, { SettingsBarProps } from './SettingsBar'
import { MouseIcon } from './MouseIcon'

type RenderElementAdditionalInfo = {
  label: string;
}
export type GraphEditorProps = {
  onEvent?: (info: EventInfo) => void;
  graphConfig?: GraphConfig;
  renderMoreAction?: () => React.ReactElement;
  label?: GraphLabelData;
  settingsBar?: SettingsBarProps;
  dataBar?: Pick<DataBarProps, 'editable'| 'opened'>;
  actionBar?: Pick<ActionBarProps, 'renderMoreAction' | 'opened' | 'recording'>;
  selectedElement?: Element | null;
  mode?: EditorMode;
  renderEdge?: RenderEdge<RenderElementAdditionalInfo>;
  renderNode?: RenderNode<RenderElementAdditionalInfo>;
} & Omit<
GraphProps,
'config'|'onPress' | 'renderNode' | 'renderEdge'
>

const MODE_ICON_MAP = {
  [EDITOR_MODE.ADD]: 'plus',
  [EDITOR_MODE.DELETE]: 'minus',
  [EDITOR_MODE.CONTINUES_ADD]: 'plus-circle-outline',
  [EDITOR_MODE.CONTINUES_DELETE]: 'minus-circle-outline',
  [EDITOR_MODE.DEFAULT]: null,
}

const MODE_ICON_SCALE = 0.8
const MODE_ICON_MAP_BY_URL = {
  [EDITOR_MODE.ADD]: `https://img.icons8.com/material/${MODE_ICON_SCALE}x/plus-math.png`,
  [EDITOR_MODE.DELETE]: `https://img.icons8.com/material/${MODE_ICON_SCALE}x/minus--v2.png`,
  [EDITOR_MODE.CONTINUES_ADD]: `https://img.icons8.com/material/${MODE_ICON_SCALE}x/plus.png`,
  [EDITOR_MODE.CONTINUES_DELETE]: `https://img.icons8.com/material/${MODE_ICON_SCALE}x/minus-sign.png`,
  [EDITOR_MODE.DEFAULT]: null,
}

const DEFAULT_HANDLER = R.identity as (info: EventInfo) => void

const GraphEditorElement = (props: GraphEditorProps, ref: ForwardRef<GraphEditorRef>) => {
  const {
    onEvent = DEFAULT_HANDLER,
    renderEdge,
    renderNode,
    graphConfig,
    style,
    settingsBar,
    actionBar,
    dataBar = {},
    nodes,
    edges,
    selectedElement,
    label,
    mode = EDITOR_MODE.DEFAULT,
    ...rest
  } = props
  const graphEditorRef = useForwardRef(ref)
  const onPress = React.useCallback(({ position }: { position: Position}) => {
    // @ts-ignore
    onEvent({
      type: EVENT.PRESS_BACKGROUND,
      extraData: position,
    })
  }, [])
  const selectedItem = selectedElement && getSelectedItemByElement(
    selectedElement, { nodes, edges },
  ).item
  const selectedElementIsNode = selectedElement && selectedElement.isNode()
  const targetPath = selectedElementIsNode ? 'nodes' : 'edges'
  const selectedElementRef = React.useRef({
    selectedElement,
    selectedItem,
  })
  selectedElementRef.current = {
    selectedElement,
    selectedItem,
  }
  const onEventCallback = React.useCallback((eventInfo) => {
    const { selectedElement, selectedItem } = selectedElementRef.current
    onEvent({
      ...eventInfo,
      element: selectedElement!,
      item: selectedItem!,
    })
  }, [selectedElement, selectedItem])
  console.log('a', rest)
  return (
    <View
      style={style}
    >
      <Graph
        // @ts-ignore
        ref={graphEditorRef}
        style={{
          width: '100%',
          height: '100%',
        }}
        nodes={nodes}
        edges={edges}
        {...rest}
        extraData={{
          label,
          extraData: rest.extraData,
        }}
        config={graphConfig}
        onPress={onPress}
        renderNode={({ item, element, ...rest }) => (
          <Graph.Touchable
            onPress={() => onEvent({
              type: EVENT.ELEMENT_SELECTED,
              item,
              element,
            })}
          >
            {(renderNode ?? DefaultRenderNode)({
              item,
              element,
              // @ts-ignore
              label: getLabel(
                label?.isGlobalFirst
                  ? (label?.global.nodes ?? label?.nodes?.[item.id])
                  : (label?.nodes?.[item.id] ?? label?.global.nodes),
                item,
              ),
              ...rest,
            })}
          </Graph.Touchable>
        )}
        renderEdge={({ item, element, ...rest }) => (
          <Graph.Touchable
            onPress={() => onEvent({
              type: EVENT.ELEMENT_SELECTED,
              item,
              element,
            })}
          >

            {
               // @ts-ignore
            (renderEdge ?? DefaultRenderEdge)({
              item,
              // @ts-ignore
              label: getLabel(
                label?.isGlobalFirst
                  ? (label?.global.edges ?? label?.edges?.[item.id])
                  : (label?.edges?.[item.id] ?? label?.global.edges),
                item,
              ),
              ...rest,
            })
}
          </Graph.Touchable>
        )}
      />

      <DataBar
        {...dataBar}
        item={selectedItem}
        localLabel={selectedElement && (label?.[targetPath][selectedItem?.id!])}
        globalLabel={label?.global?.[targetPath]}
        isGlobalLabelFirst={label?.isGlobalFirst}
        onEvent={onEventCallback}
      />
      {
        settingsBar && (
          <SettingsBar
            {...settingsBar}
            onEvent={onEvent}
          />
        )
      }
      {
        actionBar && (
        <ActionBar
          onEvent={onEvent}
          graphEditorRef={graphEditorRef}
          mode={mode}
          graphConfig={graphConfig}
          {...actionBar}
        />
        )
}
      <MouseIcon
        // name={MODE_ICON_MAP[mode]}
        name={MODE_ICON_MAP_BY_URL[mode]}
        cursor
      />
    </View>
  )
}

/**
 * ## Usage
 * To create a GraphEditor easily, you can just pass data and render methods.
 * Check example
 *
 * ```js live=true
 * function MyGraphEditor() {
 *  const [data, setData] = React.useState({
 *    nodes: [
 *         { id: 1, position: { x: 10, y: 10 } },
 *         { id: 2, position: { x: 300, y: 100 } },
 *       ],
 *    edges: [
 *         { id: 51, source: 1, target: 2 }
 *       ]
 *  })
 *  return (
 *    <GraphEditor
 *       style={{ width: '100%', height: 250 }}
 *       configExtractor={({ item }) => ({ data: { data: item }})}
 *       nodes={data.nodes}
 *       edges={data.edges}
 *     />
 *  )
 * }
 * ```
 */
export const GraphEditor = wrapComponent<
PropsWithRef<GraphEditorRef, GraphEditorProps>
>(
  GraphEditorElement,
  {
    isEqual: R.equalsExclude(R.isFunction),
    isForwardRef: true,
  },
)

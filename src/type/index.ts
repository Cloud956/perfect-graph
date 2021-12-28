import React from 'react'
// import { LayoutChangeEvent } from 'react-native'
import { EdgeSingular, NodeSingular, Core } from 'cytoscape'
import { Position, Enumerable } from 'colay/type'
import { Theme } from '@core/theme'
import {
  ELEMENT_TYPE,
  EVENT,
  DATA_TYPE,
  EDITOR_MODE,
  CYTOSCAPE_EVENT,
} from '@constants'
import { Viewport as ViewportNative } from 'pixi-viewport'
import * as PIXI from 'pixi.js'
import { YogaConstants } from '@utils/addFlexLayout/flex-layout/YogaContants'
import { YogaLayout } from '@utils/addFlexLayout/flex-layout/YogaLayout'
import GraphLayouts from '@core/layouts'
import type { GraphEditorProps } from '@components/GraphEditor'
import Form from  '@rjsf/material-ui'
import type * as PIXIType from './pixi'

declare module 'pixi.js' {
  // @ts-ignore
  interface DisplayObject extends PIXI.DisplayObject {
    yoga: YogaLayout;

    /**
    * Internal property for fast checking if object has yoga
    */
    __hasYoga: boolean;

    _visible: boolean;

    flex: boolean;

    /**
    * Applies yoga layout to DisplayObject
    */
    updateYogaLayout(): void;

    /**
    * Checks boundaries of DisplayObject and emits NEED_LAYOUT_UPDATE if needed
    */
    checkIfBoundingBoxChanged(): void;
    _yogaLayoutHash: number;
    _prevYogaLayoutHash: number;
    __yoga: YogaLayout;
  }
}

declare module 'cytoscape' {
  // @ts-ignore
  interface NodeSingular extends cytoscape.NodeSingular {
    /**
     * Node element hovered
     */
    hovered: () => boolean;
    /**
     * Node element filtered
     */
    filtered: () => boolean;
  }
  // @ts-ignore
  interface EdgeSingular extends cytoscape.EdgeSingular  {
    /**
     * Edge element hovered
     */
    hovered: () => boolean;
    /**
     * Edge element filtered
     */
    filtered: () => boolean;
  }
}

/**
* Style for view components
*/
export type Style = { [k: string]: any }

/**
* Cytoscape element context
*/
export type ElementContext<T = (NodeElementSettings | EdgeElementSettings)> = {
  render: (callback?: () => void) => void;
  onPositionChange: () => void;
  settings: T
}

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
}


export type EdgeElementSettings = {
  /**
   * Edge is filtered by given filter function
   */
  filtered: boolean;
  /**
   * Edge's source or target node is filtered
   */
  nodeFiltered: boolean;
  /**
   * Visibility tracking object
   */
  visibility: {
    nodeVisible: boolean;
  }
  /**
   * Hovered state
   */
  hovered: boolean
}
export type NodeElementSettings = {
  /**
   * Node is filtered by given filter function
   */
  filtered: boolean;
  /**
   * Visibility tracking object
   */
  visibility: {
    cluster: boolean;
  }
  /**
   * Hovered state
   */
  hovered: boolean;
}

export type NodeContext = ElementContext<NodeElementSettings> & {
  /**
   * Node's bounding box without children
   */
  boundingBox: BoundingBox;
  /**
   * Node cytoscape element
   */
  element: NodeElement;
}

export type EdgeContext = ElementContext<EdgeElementSettings> & {
  /**
   * Edge cytoscape element
   */
  element: EdgeElement;
}

/**
* GraphEditor Event Types
*/
export type EventType = keyof typeof EVENT
/**
* GraphEditor mode
*/
export type EditorMode = keyof typeof EDITOR_MODE

export type AdditionalDataItem = {
  name: string;
  value: string[];
  type: RDFType;
}

export type DataItem = {
  name: string;
  value: string[];
  type: RDFType;
  additional?: AdditionalDataItem[];
}

export type Ref<T> = React.Ref<T>
export type EdgeElement = EdgeSingular
export type NodeElement = NodeSingular

export type Element = EdgeElement | NodeElement

export type ElementData = NodeData | EdgeData

export type NodeData = {
  /**
   * Node id for cytoscape
   */
  id: string;
  /**
   * Node initial position
   */
  position?: Position;
  /**
   * Node data
   */
  data?: any;
}

export type EdgeData = {
  /**
   * Edge id for cytoscape
   */
  id: string;
  /**
   * Edge source id for cytoscape
   */
  source: string;
  /**
   * Edge target id for cytoscape
   */
  target: string;
  /**
   * Edge data
   */
  data?: any;
}

export type GraphData = {
  nodes: NodeData[];
  edges: EdgeData[];
}

/**
 * Edge or Node render element function
 */
type RenderElementParams = {
  /**
   * Related cytoscape instance
   */
  cy: Core;
  /**
   * Related graph instance ref
   */
  graphRef: React.RefObject<GraphRef>;
  theme: Theme;
}

type GraphEditorRenderElementExtraParams = {
  /**
   * Selected label path
   */
  labelPath: string[];
  /**
   * Element default label
   */
  label: string;
}

type ExtendParams<T extends (a: any) => any, E> = (c: Parameters<T>[0] & E) => ReturnType<T>

export type RenderEdge<Additional extends Record<string, any> = {}> = (c: {
  /**
   * Edge data
   */
  item: EdgeData;
  /**
   * Edge cytoscape element
   */
  element: EdgeElement;
  /**
   * Edge source element
   */
  sourceElement: NodeElement;
  /**
   * Edge target element
   */
  targetElement: NodeElement;
  /**
   * Edge source position
   */
  from: Position;
  /**
   * Edge target position
   */
  to: Position;
  /**
   * Edge index among neighbors after sorting
   */
  sortedIndex: number;
  /**
   * Edge index among neighbors
   */
  index: number;
  /**
   * Edge count with neighbors
   */
  count: number;
  /**
   * Edge config data
   */
  config: EdgeConfig;
  /**
   * Edge context
   */
  context: EdgeContext;
} & RenderElementParams & Additional) => React.ReactElement

export type RenderNode<Additional extends Record<string, any> = {}> = (c: {
  /**
   * Node data
   */
  item: NodeData;
  /**
   * Node cytoscape element
   */
  element: NodeElement;
  /**
   * Node config data
   */
  config: NodeConfig;
  /**
   * Node context
   */
  context: NodeContext;
} & RenderElementParams & Additional) => React.ReactElement

export type RenderClusterNode<Additional extends Record<string, any> = {}> = (c: {
  item: Cluster;
  element: NodeElement;
  context: NodeContext;
  config: NodeConfig;
} & RenderElementParams & Additional) => React.ReactElement

export type GraphEditorRenderEdge<Additional extends Record<string, any> = {}> = ExtendParams<
RenderEdge,
GraphEditorRenderElementExtraParams & Additional
>

export type GraphEditorRenderNode<Additional extends Record<string, any> = {}> = ExtendParams<
RenderNode,
GraphEditorRenderElementExtraParams & Additional
>

export type GraphEditorRenderClusterNode<
Additional extends Record<string, any> = {},
> = ExtendParams<
RenderNode,
GraphEditorRenderElementExtraParams & Additional
>

export type ElementType = keyof typeof ELEMENT_TYPE

export type RDFValue = Enumerable<string | number>
export type RDFType = keyof typeof DATA_TYPE

export type PIXIFlexStyle = {
  display?: keyof typeof YogaConstants.Display | 'none';
  position?: keyof typeof YogaConstants.PositionType ;
  alignItems?: keyof typeof YogaConstants.Align;
  justifyContent?: keyof typeof YogaConstants.JustifyContent;
  flexDirection?: keyof typeof YogaConstants.FlexDirection;
  flexWrap?: keyof typeof YogaConstants.FlexWrap;
}
export type PIXIBasicStyle = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  marginBottom?: number;
} & PIXIFlexStyle

export type PIXIBasicProps = {
  interactive?: boolean;
  buttonMode?: boolean;
} & {
  [k in PIXIType.InteractionEventTypes]?: (e: PIXI.InteractionEvent) => void
}

export type PIXIShapeStyle = {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export type {
  Theme,
} from '../core/theme'

export type CytoscapeEvent = keyof typeof CYTOSCAPE_EVENT

export type ElementFilterOption<E> = {
  test?:(
    params: { element: E; item: (NodeData | EdgeData) }
  ) => boolean
  settings: {
    opacity: number
  }
}
export type ElementConfig<T = (NodeElement | EdgeElement)> = {
  renderEvents: CytoscapeEvent[];
  filter: ElementFilterOption<T>;
}
export type NodeConfig = {
  position?: Position;
  view: {
    width: number;
    height: number;
    radius: number;
    fill: {
      hovered: number;
      selected: number;
      default: number;
      edgeSelected: number;
    };
    labelVisible: boolean;
  }
} & ElementConfig<NodeElement>

export type EdgeLineType = 'bezier' | 'segments' | 'line'

export type EdgeConfig = {
  view: {
    lineType: EdgeLineType;
    width: number;
    alpha: number;
    fill: {
      hovered: number;
      selected: number;
      default: number;
      nodeSelected: number;
    };
    labelVisible: boolean;
  }
} & ElementConfig<EdgeElement>

export type Cluster = {
  id: string;
  name: string;
  ids: string[];
  childClusterIds: string[]
  visible?: boolean;
  position?: Position;
}

export type ClustersByNodeId = Record<string, Cluster[]>

export type ClustersByChildClusterId = Record<string, Cluster[]>

export type GraphNodesConfig = NodeConfig & {
  ids?: {
    [id: string]: NodeConfig;
  }
}

export type GraphEdgesConfig = EdgeConfig & {
  ids?: {
    [id: string]: EdgeConfig;
  }
}

export type GraphConfig = {
  layout?: typeof GraphLayouts['cose'] & {
    expansion?: number;
  };
  clusters?: Cluster[];
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
  nodes?: GraphNodesConfig;
  edges?: GraphEdgesConfig
  backgroundColor?: string;
  theme?: Theme;
  graphId?: string
}

export type DisplayObjectWithYoga = PIXI.DisplayObject & {
  flex: boolean;
  yoga: YogaLayout;
}



export type PIXIDisplayObjectProps = {
  interactive?: boolean;
  buttonMode?: boolean;
}

export type GraphLabelData = {
  global: { nodes: string[]; edges: string[] };
  nodes: Record<string, string[]>;
  edges: Record<string, string[]>;
  isGlobalFirst?: { nodes: boolean; edges: boolean; };
}

export type EventInfo = {
  id: string;
  date: string;
  type: EventType;
  item?: ElementData;
  elementId?: string;
  payload?: any;
  dataItem?: DataItem;
  index?: number;
  event?: Partial<PIXI.InteractionEvent>;
  avoidEventRecording?: boolean;
  avoidHistoryRecording?: boolean;
}

export type LightEventInfo = {
  type: EventType;
  item?: ElementData;
  elementId?: string;
  payload?: any;
  dataItem?: DataItem;
  index?: number;
  event?: Partial<PIXI.InteractionEvent>;
  avoidEventRecording?: boolean;
  avoidHistoryRecording?: boolean;
}

export type OnEvent = (eventInfo: EventInfo) => void
export type OnEventLite = (eventInfo: Omit<EventInfo, 'id' | 'date'>) => void

export type DrawLine = (
  arg: Parameters<RenderEdge>[0] & {
    graphics: PIXI.Graphics;
    to: Position;
    from: Position;
  }) => void

export type ViewportType = PIXI.DisplayObject & ViewportNative & {
  clickEvent: any;
  isClick: boolean;
  hitArea: BoundingBox;
  qualityLevel: number;
  oldQualityLevel: number;
}
export type ViewportRef = ViewportType

export type GraphRef = {
  cy: Core;
  app: PIXI.Application;
  viewport: ViewportRef;
}

export type GraphEditorRef = GraphRef & {
  context: GraphEditorContextType;
}

export type RecordedEvent = EventInfo

export type EventHistory = {
  currentIndex: number;
  events: EventInfo[];
  undoEvents: EventInfo[];
}

export type Playlist = {
  id: string;
  name: string;
  events: EventInfo[]
}

export type ControllerState = {
  label: GraphLabelData;
  onEvent: (
    eventInfo: EventInfo & {
      graphEditor: GraphEditorRef;
    },
    draft: ControllerState
  ) => boolean | void
} & Pick<
GraphEditorProps,
'nodes' | 'edges' | 'mode' | 'selectedElementIds'
| 'actionBar' | 'dataBar' | 'settingsBar'
| 'graphConfig' | 'playlists' | 'isLoading' | 'modals' | 'events'
| 'preferencesModal' | 'isFocusMode' | 'previousDataList'

>

export type GraphEditorConfig = {
  enableNetworkStatistics?: boolean;
}

export type {
  GraphEditorProps,
} from '@components/GraphEditor'

export type NetworkStatistics = {
  global?: any
  local?: any
  sort?: any;
}

export type GraphEditorContextType = {
  onEvent: OnEventLite;
  graphConfig?: GraphConfig;
  config?: GraphEditorConfig;
  label?: GraphLabelData;
  selectedElementIds?: string[] | null;
  mode?: EditorMode;
  events?: RecordedEvent[]
  eventHistory?: EventHistory;
  playlists?: Playlist[];
  localDataRef: React.RefObject<{
    initialized: boolean;
    targetNode: NodeElement | null;
    props: GraphEditorProps;
    issuedClusterId: string | null;
    newClusterBoxSelection: {
      elementIds: string[];
    };
    networkStatistics?: NetworkStatistics;
    contextMenu: {
      itemIds: string[]
    }
  }>;
  selectedItem?: ElementData | null;
  selectedElement?: Element | null;
  graphEditorRef: React.RefObject<GraphEditorRef>
  networkStatistics?: NetworkStatistics;
  nodes: NodeData[]
  edges: EdgeData[]
}


export type FormProps = React.ComponentPropsWithRef<typeof Form>
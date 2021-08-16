import { Icon } from '@components/Icon'
import { useGraphEditor } from '@hooks'
import {
  Accordion, AccordionDetails,
  AccordionSummary, Divider, IconButton, Paper, Typography,
  Button,
} from '@material-ui/core'
import { EVENT, SIDE_PANEL_DEFAULT_WIDTH } from '@constants'
import { EdgeElement } from '@type'
import {
  JSONViewer,
  useAnimation,
} from 'colay-ui'
import { View } from 'colay-ui/components/View'
import * as R from 'colay/ramda'
import React from 'react'
// import {
//   DataEditor,
// } from '../DataEditor'
import { useDragInfo } from '@hooks/useDragInfo'
import { useDrag } from '@hooks/useDrag'
import { JSONEditor } from './JSONEditor'
import { GlobalNetworkStatistics } from './GlobalNetworkStatistics'
import { LocalNetworkStatistics } from './LocalNetworkStatistics'
import { ConnectedElements } from './ConnectedElements'

export type DataBarProps = {
  editable?: boolean;
  isOpen?: boolean;
  header?: React.FC;
  footer?: React.FC;
} // & Omit<DataEditorProps, 'data'>

const WIDTH_PROPORTION = 40
const PANEL_WIDTH = 200
const ICON_SIZE = 16

export const DataBar = (props: DataBarProps) => {
  const {
    editable = true,
    isOpen = false,
    header: HeaderComponent,
    footer: FooterComponent,
    ...rest
  } = props

  const [
    {
      item,
      onEvent,
      networkStatistics,
      globalLabel,
      localLabel,
      isGlobalLabelFirst,
      selectedElement,
    },
  ] = useGraphEditor(
    (editor) => {
      const {
        selectedElement,
        selectedItem,
        label,
        localDataRef,
        networkStatistics,
      } = editor
      const targetPath = selectedElement?.isNode() ? 'nodes' : 'edges'
      return {
        graphEditorConfig: editor.config,
        item: editor.selectedItem,
        localLabel: selectedElement && (label?.[targetPath][selectedItem?.id!]),
        globalLabel: label?.global?.[targetPath],
        isGlobalLabelFirst: label?.isGlobalFirst?.[targetPath],
        onEvent: editor.onEvent,
        networkStatistics: {
          local: localDataRef.current!.networkStatistics!.local?.[selectedItem?.id!],
          global: networkStatistics?.global ?? localDataRef.current!.networkStatistics!.local?.[selectedItem?.id!],
        },
        selectedElement,
      }
    },
  )
  const {
    style: animationStyle,
    ref: animationRef,
  } = useAnimation({
    from: {
      width: 0,
    },
    to: {
      width: SIDE_PANEL_DEFAULT_WIDTH,
    },
    autoPlay: false,
  })
  const containerRef = React.useRef()
  React.useEffect(() => {
    animationRef.current?.play?.(isOpen)
  }, [animationRef, isOpen])
  const hasStatistics = Object.values(networkStatistics).find((val) => val)
  const [state, setState] = React.useState({
    isEditing: false,
  })
  const onMouseDown = useDrag({
    ref: containerRef,
    onDrag: ({ x, y }, rect) => {
      const target = containerRef.current
      target.style.width = `${rect.width + x}px`
    },
  })
  return (
    <Paper
      ref={containerRef}
      style={{
        position: 'absolute',
        height: '100%',
        top: 0,
        display: 'flex',
        flexDirection: 'row',
        right: 0,
        // width: animationStyle.right,
        ...animationStyle,
      }}
    >
      <div
        style={{
          width: 5,
          height: '100%',
          backgroundColor: 'black',
          cursor: 'col-resize',
        }}
        onMouseDown={onMouseDown}
      />
      <View
        style={{
          height: '100%',
          width: '96%',
          // @ts-ignore
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {HeaderComponent && <HeaderComponent />}
        {item && (
        <Accordion
          defaultExpanded
        >
          <AccordionSummary>
            <Typography
              variant="h6"
              style={{
                wordBreak: 'break-word',
                padding: 2,
              }}
            >
              {` id: ${item?.id}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <View style={{
              width: '100%',
              height: hasStatistics ? '70%' : '100%',
              // wordWrap: 'break-word',
              // flexWrap: 'wrap',
            }}
            >
              {/* {
                isEdge && <EdgeElementSummary element={selectedElement} />
              } */}
              {
        editable && item?.data
          && (
            // <DataEditor
            //   data={item.data}
            //   onEvent={onEvent}
            //   {...rest}
            // />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                onClick={() => setState({ ...state, isEditing: !state.isEditing })}
              >
                {state.isEditing ? 'Done' : 'Edit'}

              </Button>
            </View>
          )
      }
              {
        state.isEditing
          ? (
            <JSONEditor />
          )
          : (
            <JSONViewer
              extraData={[localLabel, globalLabel]}
              data={item?.data}
              left={(props) => {
                const {
                  item: { path },
                  collapsed, onCollapse, noChild,
                } = props
                const isLocalLabel = R.equals(path, localLabel)
                const isGlobalLabel = R.equals(path, globalLabel)
                return (
                  <>

                    <IconButton
                      size="small"
                      sx={{ height: ICON_SIZE }}
                      onClick={() => onEvent(
                        isLocalLabel
                          ? {
                            type: EVENT.CLEAR_NODE_LOCAL_LABEL,
                          }
                          : {
                            type: EVENT.SET_NODE_LOCAL_LABEL,
                            payload: {
                              value: path,
                            },
                          },
                      )}
                    >
                      <Icon
                        style={{
                          fontSize: ICON_SIZE,
                          textDecoration: !isGlobalLabelFirst ? 'underline' : '',
                        }}
                        name={
                          isLocalLabel ? 'bookmark' : 'bookmark_border'
                        }
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ height: ICON_SIZE }}
                      onClick={() => onEvent(
                        isGlobalLabel
                          ? {
                            type: EVENT.CLEAR_NODE_GLOBAL_LABEL,
                          }
                          : {
                            type: EVENT.SET_NODE_GLOBAL_LABEL,
                            payload: {
                              value: path,
                            },
                          },
                      )}
                    >
                      <Icon
                        style={{
                          fontSize: ICON_SIZE,
                          textDecoration: isGlobalLabelFirst ? 'underline' : '',
                        }}
                        name={
                          isGlobalLabel ? 'bookmarks' : 'bookmark_border'
  }
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ height: ICON_SIZE }}
                      disabled={noChild}
                      onClick={() => onCollapse(!collapsed)}
                    >
                      <Icon
                        style={{
                          fontSize: ICON_SIZE, // noChild ? 12 : ICON_SIZE,
                        }}
                        name={
                      noChild
                        ? 'fiber_manual_record'
                        : collapsed
                          ? 'arrow_drop_down_rounded'
                          : 'arrow_drop_up_rounded'
}
                      />
                    </IconButton>
                  </>
                )
              }}
              renderItem={({ item: { key, value } }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    style={{ alignContent: 'center' }}
                  >
                    {`${key}${value ? ': ' : ''}`}
                  </Typography>
                  {value
                    ? (
                      <Typography
                        variant="subtitle1"
                        // noWrap
                        display="inline"
                        style={{ alignContent: 'center' }}
                      >
                        {value}
                      </Typography>
                    )
                    : null}
                </View>
              )}
            />
          )
      }

            </View>
          </AccordionDetails>
        </Accordion>

        )}
        <Divider />
        <ConnectedElements />
        {
        hasStatistics && (
          <View
            style={{
              height: '30%',
              width: '100%',
            }}
          >
            {
          networkStatistics.global && (
            <GlobalNetworkStatistics
              data={networkStatistics.global}
              onEvent={onEvent}
            />
          )
        }
            <Divider />
            {
          networkStatistics.local && (
            <LocalNetworkStatistics
              data={networkStatistics.local}
              onEvent={onEvent}
            />
          )
        }
          </View>
        )
      }
        {FooterComponent && <FooterComponent />}
      </View>

      <IconButton
        style={{
          position: 'absolute',
          left: -34,
          top: 0,
          fontSize: 24,
        }}
        onClick={() => {
          onEvent({
            type: EVENT.TOGGLE_DATA_BAR,
            avoidHistoryRecording: true,
          })
        }}
      >
        <Icon
          name="info_outlined"
        />
      </IconButton>
    </Paper>
  )
}

type EdgeElementSummaryProps = {
  element: EdgeElement;
}
const EdgeElementSummary = (props: EdgeElementSummaryProps) => {
  const {
    element,
  } = props
  const sourceId = element.source().id()
  const targetId = element.target().id()
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Typography variant="subtitle1">source:</Typography>
        <Typography>{` ${sourceId}`}</Typography>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Typography variant="subtitle1">target:</Typography>
        <Typography>{` ${targetId}`}</Typography>
      </View>
    </View>
  )
}

// {
//   editable && item?.data
//     ? (
//       <DataEditor
//         data={item.data}
//         onEvent={onEvent}
//         {...rest}
//       />
//     )
//     : (
//       <JSONViewer
//         extraData={[localLabel, globalLabel]}
//         data={item?.data}
//         left={(props) => {
//           const {
//             item: { path },
//             collapsed, onCollapse, noChild,
//           } = props
//           const isLocalLabel = R.equals(path, localLabel)
//           const isGlobalLabel = R.equals(path, globalLabel)
//           return (
//             <>

//               <IconButton
//                 size="small"
//                 sx={{ height: ICON_SIZE }}
//                 onClick={() => onEvent(
//                   isLocalLabel
//                     ? {
//                       type: EVENT.CLEAR_NODE_LOCAL_LABEL,
//                     }
//                     : {
//                       type: EVENT.SET_NODE_LOCAL_LABEL,
//                       payload: {
//                         value: path,
//                       },
//                     },
//                 )}
//               >
//                 <Icon
//                   style={{
//                     fontSize: ICON_SIZE,
//                     textDecoration: !isGlobalLabelFirst ? 'underline' : '',
//                   }}
//                   name={
//                     isLocalLabel ? 'bookmark' : 'bookmark_border'
//                   }
//                 />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 sx={{ height: ICON_SIZE }}
//                 onClick={() => onEvent(
//                   isGlobalLabel
//                     ? {
//                       type: EVENT.CLEAR_NODE_GLOBAL_LABEL,
//                     }
//                     : {
//                       type: EVENT.SET_NODE_GLOBAL_LABEL,
//                       payload: {
//                         value: path,
//                       },
//                     },
//                 )}
//               >
//                 <Icon
//                   style={{
//                     fontSize: ICON_SIZE,
//                     textDecoration: isGlobalLabelFirst ? 'underline' : '',
//                   }}
//                   name={
//                     isGlobalLabel ? 'bookmarks' : 'bookmark_border'
// }
//                 />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 sx={{ height: ICON_SIZE }}
//                 disabled={noChild}
//                 onClick={() => onCollapse(!collapsed)}
//               >
//                 <Icon
//                   style={{
//                     fontSize: ICON_SIZE, // noChild ? 12 : ICON_SIZE,
//                   }}
//                   name={
//                 noChild
//                   ? 'fiber_manual_record'
//                   : collapsed
//                     ? 'arrow_drop_down_rounded'
//                     : 'arrow_drop_up_rounded'
// }
//                 />
//               </IconButton>
//             </>
//           )
//         }}
//         renderItem={({ item: { key, value } }) => (
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//             }}
//           >
//             <Typography
//               variant="subtitle1"
//               style={{ alignContent: 'center' }}
//             >
//               {`${key}${value ? ': ' : ''}`}
//             </Typography>
//             {value
//               ? (
//                 <Typography
//                   variant="subtitle1"
//                   // noWrap
//                   display="inline"
//                   style={{ alignContent: 'center' }}
//                 >
//                   {value}
//                 </Typography>
//               )
//               : null}
//           </View>
//         )}
//       />
//     )
// }

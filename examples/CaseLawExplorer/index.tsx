import React from 'react'
import * as R from 'unitx/ramda'
import mingo from 'unitx/mingo'
import { ApplicationProvider, Button, Layout,useTheme, } from 'unitx-ui'
import { 
  DarkTheme,
  DefaultTheme,
} from 'unitx-ui'
import  { GraphEditorProps,GraphEditor } from '../../src/components/GraphEditor'
import { Graph } from '../../src/components'
import {drawLine} from '../../src/components/Graphics'
import data from './data'
import * as C from 'unitx/color'
import { FILTER_SCHEMA, VIEW_CONFIG_SCHEMA  } from './constants'
import { EVENT } from '../../src/utils/constants'
import {useController} from '../../src/plugins/controller'

type Props = Partial<GraphEditorProps>

const NODE_SIZE = {
  width: 80,
  height: 80,
}
const NODE_SIZE_RANGE = [50, 100]
const NODE_COLOUR_RANGE = ['000000', 'FFFFFF']
const AppContainer = ({
  changeTheme,
  ...rest
}) => {
  const configRef = React.useRef({
    visualization: {
      nodeSize: null,
      nodeColor: null
    },
  })
  const [controllerProps] = useController({
    ...data,
    settingsBar: {
      opened: true,
      forms: [FILTER_SCHEMA, VIEW_CONFIG_SCHEMA]
    },
    extraData: [configRef.current.visualization],
    onEvent: ({
      type,
      extraData
    }) => {
      console.log('all', type,extraData)
      switch (type) {
        
        case EVENT.SETTINGS_FORM_CHANGED:{
          if (extraData.form.schema.title === FILTER_SCHEMA.schema.title) {

          } else {
            console.log('all2', extraData)
            configRef.current.visualization = extraData.value
          }
          break
        }
      
        default:
          break;
      }
      return null
    }
  },)
  const graphRef = React.useRef(null)
  const theme = useTheme()
  return (
      <Layout style={{ width: '100%', height: '100%'}}>
      <GraphEditor
        ref={graphRef}
        {...controllerProps}
        extraData={[configRef.current.visualization]}
        style={{ width: '100%', height: '100%', }}
        // graphConfig={{
        //   // layout: Graph.Layouts.breadthfirst,
        //   zoom: 0.5
        // }}
        drawLine={({ graphics, to, from }) => {
          drawLine({
            graphics,
            to,
            from,
            directed: true,
            box: {
              width: NODE_SIZE.width + 10,
              height: NODE_SIZE.height + 10
            },
            fill:C.rgbNumber(theme.colors.text)
            // type: 'bezier'
          })
        }}
        renderNode={({ item: { id, data } }) => {
          console.log(id, configRef.current.visualization)
          return (
            <Graph.HoverContainer
              style={{
                ...NODE_SIZE,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 25
                }}
                renderHoverElement={() => (
                  <Graph.View
                    style={{
                      width: NODE_SIZE.width * 2,
                      height: 20,
                      position: 'absolute',
                      left: 0,
                    }}
                  >
                    <Graph.Text style={{
                      fontSize: 20,
                       textAlign: 'center',
                      }}>
                      {R.replace('ECLI:NL:', '')(data.ecli)}
                    </Graph.Text>
                  </Graph.View>
                )}
            >
              <Graph.Text style={{fontSize: 10}}>
                {R.replace('ECLI:NL:', '')(data.ecli)}
              </Graph.Text>
            </Graph.HoverContainer>
          )
        }}
        {...rest}
      />
      </Layout>
  )
}

export const mergeDeepAll = (list: Record<string, any>[]) => R.reduce(
  R.mergeDeepRight,
  // @ts-ignore
  {},
)(list)



const filterEdges = (nodes: {id: string}[]) => (edges: {source:string;target:string}[]) => {
  const nodeMap = R.groupBy(R.prop('id'))(nodes)
  return R.filter(
    (edge) => nodeMap[edge.source] && nodeMap[edge.target]
  )(edges)
}
export default (props: Props) => {
  const [isDefault, setIsDefault] = React.useState(true)
const changeTheme = () => {
  setIsDefault(!isDefault)
}

  return (
    <ApplicationProvider 
      theme={isDefault  ? DefaultTheme : DarkTheme}
    >
      <AppContainer  changeTheme={changeTheme} {...props}/>
    </ApplicationProvider>
  )
}
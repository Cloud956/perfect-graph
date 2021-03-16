import {
  IconButton, Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Checkbox,
} from '@material-ui/core'
import {
  Cluster,
} from '@type'
import {
  View,
  wrapComponent,
} from 'colay-ui'
import React from 'react'
import { EVENT } from '@utils/constants'
import * as R from 'colay/ramda'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import { Icon } from '../../../Icon'

export type ClusterTableProps = {
  opened?: boolean;
  onEvent: OnEventLite;
  selectedClusterIds: string[]
  clusters: Cluster[];
  onSelectAllClusters: (checked: boolean) => void
  onSelectCluster: (cluster: Cluster, checked: boolean) => void
}
export const ClusterTable = (props: ClusterTableProps) => {
  const {
    onSelectAllClusters,
    onSelectCluster,
    onEvent,
    clusters,
    selectedClusterIds = [],
  } = props
  const hasSelected = selectedClusterIds.length > 0
  return (
    <Accordion>
      <AccordionSummary
        aria-controls="panel1a-content"
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {
              hasSelected && (
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  checked={!R.isEmpty(selectedClusterIds)
               && selectedClusterIds.length === clusters.length}
                  onChange={(_, checked) => onSelectAllClusters(checked)}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              )
            }
            <Typography
              variant="h6"
            >
              Clusters
            </Typography>
          </View>
          {
            hasSelected && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Icon
                  name="delete_rounded"
                />
              </IconButton>
            )
          }
        </View>
      </AccordionSummary>
      <AccordionDetails>
        {
          clusters.length === 0 && (
            <Typography>
              Let's create a Cluster.
            </Typography>
          )
        }
        <List dense>
          {
            clusters.map((cluster, index) => {
              const { events, id, name } = cluster
              return (
                <Accordion
                  key={id}
                >
                  <AccordionSummary
                    aria-controls="panel1a-content"
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox
                          onClick={(e) => e.stopPropagation()}
                          checked={!R.isEmpty(selectedClusterIds)
                          && selectedClusterIds.length === clusters.length}
                          onChange={(_, checked) => onSelectAllClusters(checked)}
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                        <Typography
                          variant="h6"
                        >
                          {name}
                        </Typography>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Icon
                            name="delete_rounded"
                          />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="beenhere"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEvent({
                              type: EVENT.SELECT_CLUSTER,
                              payload: {
                                cluster,
                              },
                            })
                            // onPlay(cluster)
                          }}
                        >
                          <Icon name="play_arrow" />
                        </IconButton>
                      </View>
                    </View>
                  </AccordionSummary>
                  <AccordionDetails>
                    {
                        events.map((event) => (
                          <ListItem
                            key={event.id}
                          >
                            <ListItemAvatar>
                              <Checkbox
                                // checked={selectedClustersIds.includes(id)}
                                // onChange={(_, checked) => {
                                //   onSelectCluster(cluster, checked)
                                // }}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={event.type}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <Icon name="delete_rounded" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      }
                  </AccordionDetails>
                </Accordion>
              )
            })
          }
        </List>
      </AccordionDetails>
    </Accordion>
  )
}

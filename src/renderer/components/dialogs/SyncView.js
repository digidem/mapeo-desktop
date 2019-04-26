import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import React from 'react'
import { ipcRenderer } from 'electron'
import CircularProgress from '@material-ui/core/CircularProgress'
import SyncIcon from '@material-ui/icons/Sync'
import ErrorIcon from '@material-ui/icons/Error'
import Dialog from '@material-ui/core/Dialog'
import LinearProgress from '@material-ui/core/LinearProgress'

import SyncManager from '../../sync-manager'
import Form from '../Form'
import i18n from '../../../i18n'

function LoadingIcon (props) {
  return <CircularProgress />
}

var Subtitle = styled.div`
  background-color: var(--main-bg-color);
  color: white;
  vertical-align: middle;
  padding: 5px 20px;
`

var TargetsDiv = styled.div`
  background-color: white
  color: black;
  .loading {
    background-color: white;
    color: grey;
    font-style: italic;
    font-size: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
`

var TargetItem = styled.li`
  min-width: 250px;
  padding: 20px;
  border-bottom: 1px solid grey;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  align-items: center;
  &.clickable:hover {
    background-color: #eee;
    cursor: pointer;
  }
  .target {
    display: flex;
    flex-direction: column;
    vertical-align: middle;
    font-weight: bold;
    font-size: 16px;
  }
  .message {
    font-weight: normal;
    font-size: 14px;
    font-style: italic;
  }
  .icon {
    min-width: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
`

export default class SyncView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      peers: []
    }
    this.sync = new SyncManager()
    this.selectFile = this.selectFile.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onPeers = this.onPeers.bind(this)
    this.onError = this.onError.bind(this)
  }

  onError (err) {
    ipcRenderer.send('error', err.message)
  }

  onPeers (peers) {
    this.setState({ peers })
  }

  componentWillUnmount () {
    this.sync.leave()
    this.sync.removeListener('peers', this.onPeers)
    this.sync.removeListener('error', this.onError)
    ipcRenderer.removeListener('select-file', this.selectFile)
  }

  componentDidMount () {
    this.sync.on('peers', this.onPeers)
    this.sync.on('error', this.onError)
    this.sync.join()
    ipcRenderer.on('select-file', this.selectFile)
  }

  onClose () {
    // TODO: allow closing the sync screen during replication
    // right now, assumes all streams are done replicating and progress tracker
    // can be cleaned up
    this.sync.clearState()
    this.props.onClose()
    ipcRenderer.send('refresh-window')
  }

  selectExisting (event) {
    event.preventDefault()
    ipcRenderer.send('open-file')
  }

  selectNew (event) {
    event.preventDefault()
    ipcRenderer.send('save-file')
  }

  selectFile (event, filename) {
    if (!filename) return
    this.sync.start({ filename })
  }

  render () {
    var self = this
    const { peers } = this.state
    if (this.props.filename) this.sync.start({ filename: this.props.filename })
    var wifiPeers = this.sync.wifiPeers(peers)
    var syncing = false
    return (
      <Dialog onClose={this.onClose} closeButton={false} open disableBackdropClick>
        <TargetsDiv id='sync-targets'>
          { wifiPeers.length === 0
            ? <Subtitle>{i18n('sync-searching-targets')}&hellip;</Subtitle>
            : <Subtitle>{i18n('sync-available-devices')}</Subtitle>
          }
          {peers.map((peer) => {
            syncing = (peer.state.topic !== 'replication-wifi-ready' && peer.state.topic !== 'replication-complete')
            return <Target peer={peer}
              onStartClick={() => this.sync.start(peer)}
              onCancelClick={() => this.sync.cancel(peer)} />
          })}
        </TargetsDiv>
        <Form method='POST' className='modal-group'>
          <input type='hidden' name='source' />
          <div>
            <Button id='sync-open' onClick={this.selectExisting}>
              {i18n('sync-database-open-button')}&hellip;
            </Button>
            <Button id='sync-new' onClick={this.selectNew}>
              {i18n('sync-database-new-button')}&hellip;
            </Button>
            <Button id='sync-done' onClick={self.onClose} disabled={syncing}>
              {i18n('done')}
            </Button>
          </div>
        </Form>
      </Dialog>
    )
  }
}
var VIEWS = {
  'replication-complete': {
    message: i18n('replication-complete'),
    complete: true
  },
  'replication-error': {
    icon: ErrorIcon
  },
  'replication-waiting': {
    icon: LoadingIcon,
    message: i18n('replication-started')
  },
  'replication-started': {
    icon: LoadingIcon,
    message: i18n('replication-started')
  },
  'replication-progress': {
    icon: LoadingIcon,
    message: i18n('replication-progress')
  },
  'replication-wifi-ready': {
    icon: SyncIcon,
    message: i18n(`sync-wifi-info`),
    ready: true
  }
}

// turn the messages into strings once
// so the function isn't called for every row
class Target extends React.PureComponent {
  calcProgress (val) {
    if (val.sofar === val.total) return 100
    if (val.total === 0) return 0
    return Math.floor((val.sofar / val.total) * 100)
  }

  getView () {
    const {peer} = this.props
    var state = peer.state
    var view = VIEWS[state.topic]
    if (!view) view = {}
    view.message = view.message || state.message
    return view
  }

  render () {
    const {peer} = this.props
    var state = peer.state
    var message = state.message

    if (state.topic === 'replication-progress' && message) {
      var dbCompleted = this.calcProgress(message.db)
      var mediaCompleted = this.calcProgress(message.media)
    }
    var view = this.getView()

    return (
      <TargetItem
        className={view.ready ? 'clickable' : ''}
        key={peer.name}
        onClick={this.props.onStartClick}>
        <div className='target'>
          <span className='name'>{peer.name}</span>
          <span className='message'>{view.message}</span>
          { dbCompleted > 0 && <LinearProgress value={dbCompleted} variant='buffer' valueBuffer={dbCompleted} />}
          { mediaCompleted > 0 && <LinearProgress color='secondary' value={mediaCompleted} variant='buffer' valueBuffer={mediaCompleted} />}
        </div>
        {view.icon && <div className='icon'><view.icon /></div>}
      </TargetItem>
    )
  }
}


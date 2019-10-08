import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import React from 'react'
import { ipcRenderer } from 'electron'
import SyncIcon from '@material-ui/icons/Sync'
import ErrorIcon from '@material-ui/icons/Error'
import Dialog from '@material-ui/core/Dialog'
import CircularProgress from '@material-ui/core/CircularProgress'

import SyncManager from '../../sync-manager'
import Form from '../Form'
import i18n from '../../i18n'

var Subtitle = styled.div`
  background-color: var(--main-bg-color);
  color: white;
  vertical-align: middle;
  padding: 5px 20px;
`

var TargetsDiv = styled.div`
  background-color: white;
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

var TargetItem = styled.div`
  .view {
    border-bottom: 1px solid grey;
    min-width: 250px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    vertical-align: middle;
    align-items: center;
  }
  .clickable:hover {
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
  .message, .completed {
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
  .progress {
    width: 100%;
  }
}
`

export default class SyncView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      peers: [],
      errors: {}
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
    const errors = this.state.errors
    peers = peers.map(peer => {
      if (peer.state && peer.state.topic === 'replication-error') {
        errors[peer.id] = peer.state.message
      }

      if (peer.state.lastCompletedDate > this.opened) {
        peer.state.topic = 'replication-complete'
      }

      if (errors[peer.id]) {
        peer.state.topic = 'replication-error'
        peer.state.message = errors[peer.id]
      }
      return peer
    })

    this.setState({ peers, errors })
  }

  componentWillUnmount () {
    this.sync.leave()
    this.sync.removeListener('peers', this.onPeers)
    this.sync.removeListener('error', this.onError)
    ipcRenderer.removeListener('select-file', this.selectFile)
  }

  componentDidMount () {
    this.opened = Date.now()
    this.sync.on('peers', this.onPeers)
    this.sync.on('error', this.onError)
    this.sync.join()
    ipcRenderer.on('select-file', this.selectFile)
  }

  onClose () {
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
    var disabled = false
    return (
      <Dialog
        onClose={this.onClose}
        closeButton={false}
        open
        disableBackdropClick
      >
        <TargetsDiv id='sync-targets'>
          {wifiPeers.length === 0 ? (
            <Subtitle>{i18n('sync-searching-targets')}&hellip;</Subtitle>
          ) : (
            <Subtitle>{i18n('sync-available-devices')}</Subtitle>
          )}
          {peers.map(peer => {
            disabled =
              peer.state.topic !== 'replication-wifi-ready' &&
              peer.state.topic !== 'replication-complete' &&
              peer.state.topic !== 'replication-error'
            return (
              <Target
                peer={peer}
                key={peer.id}
                onStartClick={this.sync.start}
                onCancelClick={this.sync.cancel}
              />
            )
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
            <Button id='sync-done' onClick={self.onClose} disabled={disabled}>
              {i18n('done')}
            </Button>
          </div>
        </Form>
      </Dialog>
    )
  }
}

var TOPICS = {
  'replication-waiting': {
    message: i18n('replication-started')
  },
  'replication-started': {
    message: i18n('replication-started')
  },
  'replication-progress': {
    message: i18n('replication-progress')
  },
  'replication-wifi-ready': {
    icon: SyncIcon,
    message: i18n('sync-wifi-info'),
    ready: true
  }
}

class Target extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      syncing: false
    }
  }

  handleClick (peer) {
    this.props.onStartClick(peer)
    this.setState({ syncing: true })
  }

  calcProgress (val) {
    if (val.sofar === val.total) return 100
    if (val.total === 0) return 0
    return Math.floor((val.sofar / val.total) * 100)
  }

  render () {
    const { peer } = this.props
    var state = peer.state
    var message = state.message

    var topic = peer.state.topic

    if (this.state.syncing) {
      if (this.props.topic !== 'replication-wifi-ready') {
        this.setState({ syncing: false })
      } else topic = 'replication-started'
    }
    var progress

    if (peer.state.topic === 'replication-progress' && message) {
      progress = this.calcProgress({
        sofar: message.db.sofar + message.media.sofar * 50,
        total: message.db.total + message.media.total * 50
      })
    }

    return (
      <TargetItem>
        <TargetView
          topic={topic}
          message={peer.state.message}
          name={peer.name}
          onStartClick={this.handleClick.bind(this, peer)}
          progress={progress}
          lastCompletedDate={peer.state.lastCompletedDate}
        />
      </TargetItem>
    )
  }
}

function getView (topic, message) {
  var view

  switch (topic) {
    case 'replication-complete':
      var time = message ? new Date(message).toLocaleTimeString() : ''
      view = {
        message: i18n('replication-complete', time),
        complete: true
      }
      break
    case 'replication-error':
      view = {
        icon: ErrorIcon,
        message: message
      }
      break
    default:
      view = TOPICS[topic]
  }

  return view
}

class TargetView extends React.PureComponent {
  render () {
    const { name, message, topic, progress, lastCompletedDate } = this.props

    var view = getView(topic, message)

    if (!view) {
      view = {}
      console.error('this is bad, there was no view available for peer')
    }

    return (
      <div
        className={view.ready ? 'view clickable' : 'view'}
        onClick={this.props.onStartClick}
      >
        <div className='target'>
          <span className='name'>{name}</span>
          <span className='message'>{view.message}</span>
          {lastCompletedDate && (
            <span className='completed'>
              Last completed {new Date(lastCompletedDate).toLocaleString()}
            </span>
          )}
        </div>
        {view.icon && (
          <div className='icon'>
            <view.icon />
          </div>
        )}
        {progress > 0 && progress < 100 && (
          <div className='icon'>
            <span className='message'>{progress}%</span>
            <CircularProgress
              color='primary'
              value={progress}
              variant='determinate'
            >
              ${progress}%{' '}
            </CircularProgress>
          </div>
        )}
      </div>
    )
  }
}

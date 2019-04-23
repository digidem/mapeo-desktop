import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import React from 'react'
import { ipcRenderer } from 'electron'
import CircularProgress from '@material-ui/core/CircularProgress'
import SyncIcon from '@material-ui/icons/Sync'
import Dialog from '@material-ui/core/Dialog'
import LinearProgress from '@material-ui/core/LinearProgress';

import api from '../../api'
import Form from '../Form'
import i18n from '../../lib/i18n'

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

var Target = styled.li`
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
  .info {
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
      peers: [],
      progress: {}
    }
    this.cancelling = false
    this.selectFile = this.selectFile.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  replicate (target) {
    var self = this
    if (!target) return
    target.name = target.filename || target.name
    var progress = this.state.progress
    var stream = api.start(target, {interval: 3000})
    // this.openConnections[target.id] = stream
    // TODO: allow closing the sync screen during replication
    // keep track of open connections and clean them up when the sync screen
    // closes. for now this is disallowed
    stream.on('data', (data) => {
      data = JSON.parse(data.toString())
      var progress = this.state.progress
      progress[target.name] = { target, data }
      this.setState({ progress })
    })
    progress[target.name] = {
      target: target,
      data: {
        'topic': 'replication-waiting'
      }
    }
    self.setState({ progress })
  }

  componentWillUnmount () {
    if (this.interval) clearInterval(this.interval)
    ipcRenderer.removeListener('select-file', this.selectFile)
  }

  componentDidMount () {
    var self = this
    this.interval = setInterval(function () {
      api.peers(function (err, peers) {
        if (err) return console.error(err)
        self.setState({ peers })
      })
    }, 2000)
    api.join(function (err) {
      if (err) console.error(err)
    })
    ipcRenderer.on('select-file', this.selectFile)
  }

  onCancel () {
    var self = this
    // TODO: expose this through the UI
    if (this.cancelling) return
    this.cancelling = true
    api.stop(function (err) {
      if (err) console.error(err)
      self.props.onClose()
    })
  }

  onClose () {
    // TODO: allow closing the sync screen during replication
    // right now, assumes all streams are done replicating and progress tracker
    // can be cleaned up
    this.setState({progress: {}})
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
    this.replicate({ filename })
  }

  render () {
    var self = this
    if (this.props.filename) this.replicate({ filename: this.props.filename })
    var available = this.state.peers.map((peer) => {
      var progress = this.state.progress[peer.name]
      if (!progress) return getView(peer, { topic: 'replication-wifi' })
      return false
    })
    var progressing = Object.values(this.state.progress).map((progress) => getView(progress.target, progress.data))
    var complete = progressing.filter((s) => s.complete)
    var syncing = progressing.filter((s) => !s.complete)
    let body = <div>
      <TargetsDiv id='sync-targets'>
        { available.length === 0
          ? <Subtitle>{i18n('sync-searching-targets')}&hellip;</Subtitle>
          : <Subtitle>{i18n('sync-available-devices')}</Subtitle>
        }
        {available.map(function (view) {
          if (!view) return
          var target = view.target
          return (
            <Target className='clickable' key={target.name} onClick={self.replicate.bind(self, target)}>
              <div className='target'>
                <span className='name'>{target.name}</span>
                <span className='info'>{view.info}</span>
              </div>
              <div className='icon'><view.icon /></div>
            </Target>
          )
        })}

        {syncing.map(function (view) {
          var target = view.target
          var progress = view.data.message
          function calcProgress (val) {
            if (val.sofar === val.total) return 100
            if (val.total === 0) return 0
            return Math.floor((val.sofar / val.total) * 100)
          }
          if (progress) {
            var dbCompleted = calcProgress(progress.db)
            var mediaCompleted = calcProgress(progress.media)
            var diff = 10 // faking this.
          }

          return (
            <Target key={target.name + '-syncing'}>
              <div className='target'>
                <span className='name'>{target.name}</span>
                <span className='info'>{view.info}</span>
                { dbCompleted > 0 && <LinearProgress value={dbCompleted} variant='buffer' valueBuffer={dbCompleted + diff} />}
                { mediaCompleted > 0 && <LinearProgress color='secondary' value={mediaCompleted} variant='buffer' valueBuffer={mediaCompleted + diff} />}
              </div>
            </Target>
          )
        })}

        {complete.map(function (view) {
          var target = view.target
          return (
            <Target key={target.name + '-complete'}>
              <div className='target'>
                <span className='name'>{target.name}</span>
                <span className='info'>{view.info}</span>
              </div>
            </Target>
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
          {syncing.length === 0 &&
          <Button id='sync-done' onClick={self.onClose}>
            {i18n('done')}
          </Button>
          }
        </div>
      </Form>
    </div>

    return (
      <Dialog onClose={this.onClose} closeButton={false} open disableBackdropClick>
        {body}
      </Dialog>
    )
  }
}

// turn the messages into strings once
// so the function isn't called for every row
var messages = {
  'replication-complete': {
    info: i18n('replication-complete'),
    complete: true
  },
  'replication-waiting': {
    icon: LoadingIcon,
    info: i18n('replication-started')
  },
  'replication-started': {
    icon: LoadingIcon,
    info: i18n('replication-started')
  },
  'replication-progress': {
    icon: LoadingIcon,
    info: i18n('replication-progress')
  },
  'replication-wifi': {
    icon: SyncIcon,
    info: i18n(`sync-wifi-info`),
    ready: true
  }
}

function getView (target, data) {
  if (data.topic === 'replication-error') throw new Error(data.message) // TODO: proper error messages
  return Object.assign({target, data}, messages[data.topic])
}

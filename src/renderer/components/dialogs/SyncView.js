import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import React from 'react'
import { ipcRenderer } from 'electron'
import FlashOnIcon from '@material-ui/icons/FlashOn'
import ErrorIcon from '@material-ui/icons/Error'
import CircularProgress from '@material-ui/core/CircularProgress'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import SyncManager from '../../sync-manager'
import Form from '../Form'
import i18n from '../../../i18n'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#39527b'
    },
    secondary: {
      main: '#fff'
    }
  }
})

const Container = styled.div`
  flex: 1;
`

const Nav = styled.div`
  width: 98%;
  padding: 0.5em 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .bold {
    font-weight: 600;
  }
`

var Subtitle = styled.div`
  font-size: 2em;
  padding: 5px 20px;
`

const SearchingDiv = styled.div`
  background-color: #EAEAEA;
  color: black;
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  .title {
    display: flex;
  }
`

var TargetsDiv = styled.div`
  background-color: #EAEAEA;
  color: black;
  display: flex;
  height: 100%;
}
`

var TargetItem = styled.div`
  .view {
    position: relative;
    margin: 2vw;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    width: 250px;
    height: 250px
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .clickable:hover {
    border-color: #2752d1;
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
  /* .icon {
    position: absolute;
    bottom: 1vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
  } */
  .progress {
    width: 100%;
  }
}
`

const TargetIconContainer = styled.div`
  border: solid 1px #EAEAEA;
  border-radius: 6px;
  padding: 0.5em 1em;
  display: flex;
  position: absolute;
  bottom: 1vw;
  font-weight: 600;
  .icon {
    margin-right: 0.5em;
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
    let errors = this.state.errors
    peers = peers.map((peer) => {
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
    const { peers } = this.state
    if (this.props.filename) this.sync.start({ filename: this.props.filename })
    return (
      <Container>
        <MuiThemeProvider theme={theme}>
          <Nav>
            <div><span className='bold'>{i18n('sync-available-devices')}</span> {i18n('sync-wifi-info')}</div>
            <Form method='POST' style={{display: 'inline-block'}}>
              <input type='hidden' name='source' />
              <div>
                <Button variant='outlined' id='sync-open' onClick={this.selectExisting}>
                  {i18n('sync-database-open-button')}&hellip;
                </Button>
                <Button variant='outlined' id='sync-new' onClick={this.selectNew}>
                  {i18n('sync-database-new-button')}&hellip;
                </Button>
              </div>
            </Form>
          </Nav>
          {peers.length === 0
            ? (
              <SearchingDiv>
                <div className='title'>
                  <CircularProgress />
                  <Subtitle>
                    {i18n('sync-searching-targets')}&hellip;
                  </Subtitle>
                </div>
                <div>
                  {i18n('sync-searching-tip')}
                </div>
              </SearchingDiv>
            ) : (
              <TargetsDiv id='sync-targets'>
                {peers.map((peer) => {
                  return <Target peer={peer} key={peer.id}
                    onStartClick={this.sync.start}
                    onCancelClick={this.sync.cancel} />
                })}
              </TargetsDiv>
            )
          }
        </MuiThemeProvider>
      </Container>
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
    icon: FlashOnIcon,
    iconLabel: 'Sync',
    message: i18n(`sync-wifi-info`),
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
    this.setState({syncing: true})
  }

  calcProgress (val) {
    if (val.sofar === val.total) return 100
    if (val.total === 0) return 0
    return Math.floor((val.sofar / val.total) * 100)
  }

  render () {
    const {peer} = this.props
    var state = peer.state
    var message = state.message

    var topic = peer.state.topic

    if (this.state.syncing) {
      if (this.props.topic !== 'replication-wifi-ready') this.setState({syncing: false})
      else topic = 'replication-started'
    }
    var progress

    if (peer.state.topic === 'replication-progress' && message) {
      progress = this.calcProgress({
        sofar: message.db.sofar + (message.media.sofar * 50),
        total: message.db.total + (message.media.total * 50)
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
    const {
      name,
      message,
      topic,
      progress,
      lastCompletedDate
    } = this.props
    var view = getView(topic, message)

    if (!view) {
      view = {}
      console.error('this is bad, there was no view available for peer')
    }
    return (
      <div className={view.ready ? 'view clickable' : 'view'} onClick={this.props.onStartClick}>
        <div className='target'>
          <span className='name'>{name}</span>
          <span className='message'>{view.message}</span>
          {lastCompletedDate && <span className='completed'>Last completed {new Date(lastCompletedDate).toLocaleString()}</span>}
        </div>
        { view.icon && (
          <TargetIconContainer>
            <div className='icon'>
              <view.icon />
            </div>
            <div>{view.iconLabel}</div>
          </TargetIconContainer>
        ) }
        {progress > 0 && progress < 100 && (
          <TargetIconContainer style={{backgroundColor: 'blue', color: 'white'}}>
            <div className='icon'>
              <CircularProgress
                color='secondary'
                size={15}
                value={progress}
                variant='determinate'>
                ${progress}%
              </CircularProgress>
            </div>
            <div className='message'>
              Syncing
            </div>
          </TargetIconContainer>
        )}
      </div>
    )
  }
}

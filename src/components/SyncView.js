import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import React from 'react'
import { remote, ipcRenderer } from 'electron'
import SyncIcon from '@material-ui/icons/Sync'
import DoneIcon from '@material-ui/icons/Done'
import ErrorIcon from '@material-ui/icons/Error'

import api from '../api'
import MapFilter from './MapFilter'
import Modal from './Modal'
import Form from './Form'
import i18n from '../lib/i18n'

const osmServerHost = 'http://' + remote.getGlobal('osmServerHost')

const Loading = styled.img`
  width: 1em;
  height: 1em;
  display: inline-block;
  font-size: 24px;
`

function LoadingIcon (props) {
  var src = `${osmServerHost}/static/spinner.png`
  return (<Loading src={src} />)
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
    text-align: center;
    font-style: italic;
    font-size: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
`

var Target = styled.li`
  min-width: 300px;
  padding: 20px;
  border-bottom: 1px solid grey;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  &:hover {
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
    padding-left: 10px;
    font-weight: normal;
    font-size: 14px;
    font-style: italic;
  }
  .icon {
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
      targets: [],
      replicated: false
    }
    this.selectFile = this.selectFile.bind(this)
  }

  replicate (target) {
    var self = this
    if (!target) return
    api.start(target, function (err, body) {
      if (err) console.error(err) // TODO handle errors more gracefully
      self.setState({ replicated: true })
    })
  }

  componentWillUnmount () {
    if (this.interval) clearInterval(this.interval)
    api.unannounce(function (err) {
      if (err) console.error(err)
    })
    ipcRenderer.removeListener('select-file', this.selectFile)
  }

  componentDidMount () {
    var self = this
    this.interval = setInterval(function () {
      api.getTargets(function (err, targets) {
        if (err) return console.error(err)
        self.setState({ targets })
      })
      api.announce(function (err) {
        if (err) console.error(err)
      })
    }, 1000)
    ipcRenderer.on('select-file', this.selectFile)
  }

  onClose () {
    this.props.onClose()
    if (this.state.replicated) this.props.changeView(MapFilter)
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
    var { targets } = this.state
    if (this.props.filename) this.replicate({ filename: this.props.filename })
    var onClose = this.onClose.bind(this)

    return (
      <Modal closeButton={false} onClose={onClose} title={i18n('sync-database-lead')}>
        <TargetsDiv id='sync-targets'>
          { targets.length === 0
            ? <Subtitle>{i18n('sync-searching-targets')}&hellip;</Subtitle>
            : <Subtitle>{i18n('sync-available-devices')}</Subtitle>
          }
          {targets.map(function (t) {
            var message = getMessage(t)
            return (
              <Target key={t.name} onClick={self.replicate.bind(self, t)}>
                <div className='target'>
                  <span className='name'>{t.name}</span>
                  <span className='info'>{message.info}</span>
                </div>
                <div className='icon'><message.icon /></div>
              </Target>
            )
          })}
        </TargetsDiv>
        <Form method='POST'>
          <input type='hidden' name='source' />
          <div className='button-group'>
            <Button onClick={this.selectExisting}>
              <span id='button-text'>
                {i18n('sync-database-open-button')}&hellip;
              </span>
            </Button>
            <Button onClick={this.selectNew}>
              <span id='button-text'>
                {i18n('sync-database-new-button')}&hellip;
              </span>
            </Button>
            <Button id='sync-done' onClick={onClose}>
              {i18n('done')}
            </Button>
          </div>
        </Form>
      </Modal>
    )
  }
}

// turn the messages into strings once
// so the function isn't called for every row
var messages = {
  'replication-complete': {
    icon: DoneIcon,
    info: i18n('replication-complete')
  },
  'replication-data-complete': {
    icon: DoneIcon,
    info: i18n('replication-complete')
  },
  'replication-started': {
    icon: LoadingIcon,
    info: i18n('replication-started')
  },
  'replication-progress': {
    icon: LoadingIcon,
    info: i18n('replication-progress')
  },
  'media-connected': {
    icon: LoadingIcon,
    info: i18n('replication-progress')
  },
  'osm-connected': {
    icon: LoadingIcon,
    info: i18n('replication-progress')
  }
}

function getMessage (t) {
  var defaultMessage = {
    icon: SyncIcon,
    info: i18n(`sync-${t.type}-info`)
  }
  var message = messages[t.status] || defaultMessage
  if (t.status === 'replication-error') {
    message = {
      icon: ErrorIcon,
      info: t.message
    }
  }
  return message
}

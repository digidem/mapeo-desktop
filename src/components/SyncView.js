import path from 'path'
import styled from 'styled-components'
import pump from 'pump'
import through from 'through2'
import React from 'react'
import randombytes from 'randombytes'
import {ipcRenderer} from 'electron'

import Modal from './Modal'
import MapEditor from './MapEditor'
import replicate from '../lib/replicate'
import Form from './Form'
import View from './View'
import i18n from '../lib/i18n'

// turn the messages into strings once
// so the function isn't called for every row
var messages = {
  'replication-data-complete': i18n('replication-data-complete'),
  'replication-started': i18n('replication-started'),
  'replication-complete': i18n('replication-complete'),
  'replication-progress': i18n('replication-progress')
}


var SyncButton = styled.button`
  background-color: orange;
  padding: 0px 20px;
`

var Subtitle = styled.div`
  background-color: var(--main-bg-color);
  color: white;
  vertical-align: middle;
  padding: 5px 15px;
`

var LoadingText = styled.div`
  background-color: white;
  color: grey;
  text-align: center;
  min-height: 300px;
  font-style: italic;
  font-size: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`

var Target = styled.li`
  min-width: 500px;
  padding: 20px;
  border-bottom: 1px solid grey;
  display: flex;
  justify-content: space-between;
  line-height: 30px;
  .target {
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
}
`

var TargetsDiv = styled.div`
  min-height: 300px;
  background-color: white;
  color: black;
`

export default class SyncView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      targets: [],
      wifis: {},
      files: {}
    }
    this.streams = {}
  }

  replicate (target) {
    var self = this
    if (!target) return
    var stream = replicate.start(target)
    var id = randombytes(16).toString('hex')
    this.streams[id] = stream
    stream.on('data', function (data) {
      var row = JSON.parse(data)
      var status = row.topic
      var message = messages[status] || row.message
      // TODO: this is clunky, improve status rendering via external module?
      var msg = { status, message, target }
      if (target.host) self.state.wifis[target.host] = msg
      if (target.filename) self.state.files[target.filename] = msg
      if (status !== 'replication-progress') self.setState({wifis: self.state.wifis, files: self.state.files})
    })

    stream.on('error', function (err) {
      if (err) console.error(err)
    })

    stream.on('end', function () {
      delete self.streams[id]
    })
  }

  componentWillUnmount () {
    var self = this
    Object.keys(this.streams).map((k) => self.streams[k].destroy())
    this.streams = {}
    clearInterval(this.interval)
    ipcRenderer.removeListener('select-file', this.selectFile.bind(this))
  }

  selectFile (event, filename) {
    if (!filename) return
    this.replicate({filename})
  }

  componentDidMount () {
    this.interval = setInterval(this.updateTargets.bind(this), 1000)
    ipcRenderer.on('select-file', this.selectFile.bind(this))
  }

  updateTargets () {
    var self = this
    replicate.getTargets(function (err, targets) {
      if (err) return self.onError(err)
      targets = JSON.parse(targets)
      self.setState({targets})
    })
  }

  selectExisting (event) {
    event.preventDefault()
    ipcRenderer.send('open-file')
  }

  selectNew (event) {
    event.preventDefault()
    ipcRenderer.send('save-file')
  }

  render () {
    var self = this
    var {message, status, targets, wifis, files} = this.state
    const {filename, onClose} = this.props
    if (filename) this.selectFile(filename)
    var disabled = Object.keys(self.streams).length > 0

    return (
      <Modal closeButton={false} onClose={this.props.onClose} title={i18n('sync-database-lead')}>
        <TargetsDiv>
        {targets.length === 0
          ? <Subtitle>Searching for devices&hellip;</Subtitle>
          : <Subtitle>Available Devices</Subtitle>
        }
          <ul>
            {targets.map(function (t) {
              return (
                <Target key={t.host}>
                  <div className='target'>
                    <span className='name'>{t.name}</span>
                    <span className='info'>via WiFi</span>
                  </div>
                  {wifis[t.host] ? <h3>{wifis[t.host].message}</h3> :
                    <SyncButton onClick={self.replicate.bind(self, t)}>
                      arrow
                    </SyncButton>
                  }
                </Target>
              )
            })}
            {Object.keys(files).map(function (k) {
              var t = files[k]
              return (
                <Target key={t.target.filename}>
                  <div className='target'>
                    <span className='name'>{path.basename(t.target.filename)}</span>
                    <span className='info'>via File</span>
                  </div>
                  <h3>{t.message}</h3>
                </Target>
              )
            })}
          </ul>
        </TargetsDiv>
        <Form method='POST'>
          <div className='button-group'>
            <input type='hidden' name='source' />
            <button className='big' onClick={this.selectExisting}>
              <span id='button-text'>
                {i18n('sync-database-open-button')}&hellip;
              </span>
            </button>
            <button
              className='big' onClick={this.props.onClose.bind(this)}
              disabled={disabled}>
              {disabled ? 'Please wait...' : 'Done'}
            </button>
          </div>
        </Form>
      </Modal>
    )
  }
}

import styled from 'styled-components'
import React from 'react'
import {ipcRenderer} from 'electron'

import MapEditor from './MapEditor'
import replicate from '../lib/replicate'
import Form from './Form'
import View from './View'
import i18n from '../lib/i18n'

var SyncViewDiv = styled.div`
  text-align: center;
  max-width: 900px;
  margin: auto;
`

// turn the messages into strings once
// so the function isn't called for every row
var messages = {
  'replication-data-complete': i18n('replication-data-complete'),
  'replication-complete': i18n('replication-complete'),
  'replication-progress': i18n('replication-progress'),
  'replication-ready': i18n('sync-database-lead')
}

export default class SyncView extends React.Component {
  constructor (props) {
    super(props)
    var ready = 'replication-ready'
    this.state = {
      message: messages[ready],
      status: ready,
      targets: []
    }
  }

  onClose () {
    this.props.changeView(MapEditor)
  }

  onError (err) {
    this.setState({
      message: 'Error: ' + err.message,
      status: 'replication-error'
    })
  }

  replicate (target) {
    var self = this
    if (!target) return
    replicate.start(target, function (err, res, body) {
      if (self.destroyed) return
      if (err) return self.onError(err)
      self.setState({status: 'replication-progress'})
    })
  }

  componentWillUnmount () {
    this.destroyed = true
    this.stream.destroy()
    clearInterval(this.interval)
    ipcRenderer.removeListener('select-file', this.selectFile.bind(this))
  }

  selectFile (event, filename) {
    if (!filename) return
    this.replicate({filename})
  }

  componentDidMount () {
    var self = this
    this.destroyed = false
    this.interval = setInterval(this.updateTargets.bind(this), 1000)
    this.stream = replicate.parseMessages(function (row, next) {
      if (self.destroyed) return
      var status = row.topic
      var message = messages[status] || row.message
      self.setState({message, status})
      return next()
    })
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
    var {message, status, targets} = this.state
    const {filename} = this.props
    if (filename && status === 'replication-ready') this.selectFile(filename)

    return (
      <View>
        <SyncViewDiv>
          <div>
            <h3>{message}</h3>
          </div>
          {status === 'replication-ready' && (
            <div>
              <div className='targets'>
                <ul>
                  {targets.map(function (t) {
                    return <li>{t.name}</li>
                  })}
                </ul>
              </div>
              <Form method='POST'>
                <div className='button-group'>
                  <input type='hidden' name='source' />
                  <button className='big' onClick={this.selectNew}>
                    <span id='button-text'>{i18n('sync-database-new-button')}&hellip;</span>
                  </button>
                  <button className='big' onClick={this.selectExisting}>
                    <span id='button-text'>{i18n('sync-database-open-button')}&hellip;</span>
                  </button>
                </div>
              </Form>
            </div>
          )}
          {status === 'replication-complete' && (
            <div className='button-group'>
              <button className='big' onClick={this.onClose.bind(this)}> OK</button>
            </div>
          )}
        </SyncViewDiv>
      </View>
    )
  }
}

import React from 'react'
import xhr from 'xhr'
import through from 'through2'
import split from 'split2'
import pump from 'pump'
import wsock from 'websocket-stream'
import {remote, ipcRenderer} from 'electron'

import Modal from './Modal'
import MapEditor from './MapEditor'
import Form from './Form'
import i18n from '../lib/i18n'

// turn the messages into strings once
// so the function isn't called for every row
var messages = {
  'replication-data-complete': i18n('replication-data-complete'),
  'replication-complete': i18n('replication-complete'),
  'replication-progress': i18n('replication-progress')
}

export default class ShareView extends React.Component {
  constructor (props) {
    super(props)
    var self = this
    this.state = {
      message: '',
      replicationProgress: 'ready'
    }

    this.osmServerHost = remote.getGlobal('osmServerHost')
    this.ws = wsock('ws://' + this.osmServerHost)

    ipcRenderer.on('select-file', function (event, file) {
      if (!file) return
      self.selectFile(file)
    })
  }

  selectFile (filename) {
    var self = this
    xhr({
      method: 'POST',
      url: 'http://' + self.osmServerHost + '/replicate',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        source: filename
      })
    }, function onpost (err, res, body) {
      if (err) {
        console.error(err)
        self.setState({
          message: 'Error: ' + err.message,
          replicationProgress: 'error'
        })
      } else if (res.statusCode !== 200) {
        var message = res.statusCode + ': ' + body
        console.error(err)
        self.setState({
          message: 'Error: ' + message,
          replicationProgress: 'error'
        })
      } else {
        self.setState({
          message: messages['replication-progress'],
          replicationProgress: 'progress'
        })
      }
    })
  }

  componentDidMount () {
    var self = this

    pump(self.ws, split(JSON.parse), through.obj(function (row, enc, next) {
      if (row && row.topic === 'replication-error') {
        self.setState({
          message: 'Error: ' + row.message,
          replicationProgress: 'error'
        })
      } else if (row && row.topic === 'replication-data-complete') {
        self.setState({ message: messages['replication-data-complete'] })
      } else if (row && row.topic === 'replication-complete') {
        self.setState({
          message: messages['replication-complete'],
          replicationProgress: 'complete'
        })
      } else if (row && row.topic === 'replication-progress') {
        self.setState({
          message: messages['replication-progress'],
          replicationProgress: 'progress'
        })
      }
      next()
    })).on('error', function (err) { console.error(err) })
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
    var {message, replicationProgress} = this.state
    const {onClose, filename} = this.props
    if (filename && replicationProgress === 'ready') this.selectFile(filename)

    return (
      <Modal onClose={onClose}>
        {replicationProgress === 'ready' && (
          <h3>
            {i18n('sync-database-lead')}
          </h3>
        )}
        <div>
          <h3>{message}</h3>
        </div>
        {replicationProgress === 'ready' && (
          <Form method='POST' action='/replicate'>
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
        )}
        {replicationProgress === 'complete' && (
          <div className='button-group'>
            <button className='big' onClick={onClose}> OK</button>
          </div>
        )}
      </Modal>
    )
  }
}

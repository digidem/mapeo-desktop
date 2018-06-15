import pump from 'pump'
import through from 'through2'
import styled from 'styled-components'
import React from 'react'
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

  onError (err) {
    this.setState({
      message: 'Error: ' + err.message,
      status: 'replication-error'
    })
  }

  replicate (target) {
    var self = this
    if (!target) return
    this.destroyed = false
    this.stream = replicate.start(target)
    this.stream.on('data', function (data) {
      if (self.destroyed) return
      var row = JSON.parse(data)
      var status = row.topic
      if (status === 'replication-error') return this.onError(new Error(row.message))
      var message = messages[status] || row.message
      self.setState({message, status})
    })

    this.stream.on('error', function (err) {
      if (err) console.error(err)
    })
  }

  componentWillUnmount () {
    this.destroyed = true
    if (this.stream) this.stream.destroy()
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
    var {message, status, targets} = this.state
    const {filename, onClose} = this.props
    if (filename && status === 'replication-ready') this.selectFile(filename)

    return (
      <Modal onClose={this.props.onClose}>
        <h3>{message}</h3>
        {status === 'replication-ready' && (
          <div>
            <div className='targets'>
              <ul>
                {targets.map(function (t) {
                  return (
                    <li>
                      {t.name} <button onClick={self.replicate.bind(self, t)}>Sync</button>
                    </li>
                  )
                })}
              </ul>
            </div>
            <Form method='POST'>
              <div className='button-group'>
                <input type='hidden' name='source' />
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
      </Modal>
    )
  }
}

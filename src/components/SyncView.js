import styled from 'styled-components'
import React from 'react'
import randombytes from 'randombytes'
import {ipcRenderer, remote} from 'electron'

import Modal from './Modal'
import Form from './Form'
import i18n from '../lib/i18n'

// turn the messages into strings once
// so the function isn't called for every row

var messages = {
  'replication-data-complete': i18n('replication-data-complete'),
  'replication-started': i18n('replication-started'),
  'replication-complete': i18n('replication-complete'),
  'replication-progress': i18n('replication-progress')
}


var TargetsDiv = styled.div`
  background-color: white;
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

  .subtitle {
    background-color: var(--main-bg-color);
    color: white;
    vertical-align: middle;
    padding: 5px 15px;
  }

  .sync-button {
    background-color: orange;
    padding: 0px 20px;
  }

  li.row {
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
}
`

export default class SyncView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      targets: {}
    }
    this.selectFile = this.selectFile.bind(this)
  }

  replicate (target) {
    var self = this
    if (!target) return
    var stream = replicate.start(target)
    var id = randombytes(16).toString('hex')
    this.streams[id] = stream
    stream.on('data', function (data) {
      try {
        var row = JSON.parse(data)
      } catch (err) {
        console.error(err)
        return
      }
      var t = Target(target)
      t.status = row.topic
      t.message = self.props.messages[row.topic] || row.message
      self.state.targets[target.name] = t
      if (status !== 'replication-progress') self.setState({statuses: self.state.statuses})
    })

    stream.on('error', function (err) {
      if (err) console.error(err)
    })

    stream.on('end', function () {
      delete self.streams[id]
    })
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('select-file', this.selectFile)
  }

  componentDidMount () {
    ipcRenderer.on('select-file', this.selectFile)
  }

  onClose () {
    this.props.onClose()
    ipcRenderer.send('refresh-window')
  }

  updateTargets () {
    var self = this
    getTargets(this.props.server, function (err, targets) {
      if (err) return console.error(err)
      targets = JSON.parse(targets)
      Object.keys(self.state.targets).forEach(function (name) {
        var match = targets.filter((t) => t.name === name).length
        if (!match) delete self.state.targets[name]
      })
      targets.forEach(function (t) {
        var old = self.state.targets[t.name] || {}
        self.state.targets[t.name] = Target(Object.assign(old, t))
      })
      self.setState({targets: self.state.targets})
    })}

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
    var {targets} = this.state
    if (this.props.filename) this.selectFile(this.props.filename)
    var disabled = Object.keys(self.streams).length > 0
    var onClose = this.onClose.bind(this)

    return (
      <Modal closeButton={false} onClose={onClose} title={i18n('sync-database-lead')}>
        <TargetsDiv>
        {Object.keys(targets).length === 0
          ? <Subtitle>Searching for devices&hellip;</Subtitle>
          : <Subtitle>Available Devices</Subtitle>
        }
          <ul>
            {Object.keys(targets).map(function (key) {
              var t = targets[key]
              if (t.name === 'localhost') return
              return (
                <Target key={t.name}>
                  <div className='target'>
                    <span className='name'>{t.name}</span>
                    <span className='info'>via {t.type}</span>
                  </div>
                  {t.status ? <h3>{t.message}</h3> :
                    <SyncButton onClick={self.replicate.bind(self, t)}>
                      arrow
                    </SyncButton>
                  }
                </Target>
              )
            })}
          </ul>
        </TargetsDiv>
          <Form method='POST'>
            <input type='hidden' name='source' />
            <div className='button-group'>
              <button className='big' onClick={this.selectExisting}>
                <span id='button-text'>
                  {i18n('sync-database-open-button')}&hellip;
                </span>
              </button>
              <button className='big' onClick={this.selectNew}>
                <span id='button-text'>
                  {i18n('sync-database-new-button')}&hellip;
                </span>
              </button>
              <button
                className='big' onClick={onClose}
                disabled={disabled}>
                {disabled ? 'Please wait...' : 'Done'}
              </button>
            </div>
          </Form>
        </Modal>
    )
  }
}

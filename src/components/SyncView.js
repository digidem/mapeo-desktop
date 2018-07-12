import styled from 'styled-components'
import React from 'react'
import randombytes from 'randombytes'
import {ipcRenderer, remote} from 'electron'

import SyncComponent from 'mapeo-components'
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
      filename: props.filename
    }
    this.selectFile = this.selectFile.bind(this)
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

  selectFile (event, filename) {
    this.setState({filename})
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
    const {filename} = this.state
    const onClose = this.onClose.bind(this)
    const server = 'http://' + remote.getGlobal('osmServerHost')

    return (
      <Modal closeButton={false} onClose={onClose} title={i18n('sync-database-lead')}>
        <TargetsDiv>
          <SyncComponent messages={messages} server={server} filename={filename} />
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
            <button className='big' onClick={onClose}>
              Done
            </button>
          </div>
        </Form>
      </Modal>
    )
  }
}

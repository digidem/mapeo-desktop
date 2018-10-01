import React from 'react'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'
import parallel from 'run-parallel'

import api from '../api'
import Modal from './Modal'
import i18n from '../lib/i18n'

export default class ConvertDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: false
    }
    this.submitHandler = this.submitHandler.bind(this)
  }

  submitHandler (event) {
    var self = this
    var tasks = []

    this.props.features.forEach(function (feature) {
      var task = (function () {
        return function (cb) {
          api.convert(feature, function (err, resp) {
            if (err) return cb(err)
            if (resp.statusCode !== 200) cb(new Error(resp.body))
            self.setState({ progress: self.state.progress + 1 })
            cb()
          })
        }
      })(feature)

      tasks.push(task)
    })

    parallel(tasks, function (err) {
      if (err) return console.error(err)
      self.props.changeView('MapEditor')
      this.setState({ progress: false })
    })

    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return false
  }

  render () {
    const { open, features, onClose } = this.props
    const { progress } = this.state

    var notAdded = features.filter(function (f) {
      return (f.ref === undefined && (f.properties && f.properties.element_id === undefined))
    })

    if (!open) return <div />
    var percentage = Math.round((progress / features.length) * 100)

    return (
      <Modal id='convert-dialog' onClose={onClose}>
        {progress ? (<div>
          <DialogTitle>{i18n('convert-progress', percentage)}</DialogTitle>
          <LinearProgress variant='determinate' value={percentage} />
        </div>)
          : (<div>
            <DialogTitle>{i18n('convert-number', features.length)}</DialogTitle>
            <DialogContent>
              <p> {notAdded.length
                ? i18n('convert-detail', notAdded.length)
                : i18n('convert-nothing', features.length)}
              </p>
              <DialogActions>
                <Button
                  disabled={Boolean(progress)}
                  id='convert-submit'
                  color='primary'
                  onClick={this.submitHandler}>
                  {i18n('button-submit')}
                </Button>
              </DialogActions>
            </DialogContent>
          </div>)
        }
      </Modal>
    )
  }
}

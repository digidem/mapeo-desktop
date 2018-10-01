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

  convertFeatures (features) {
    var self = this
    var tasks = []

    features.forEach(function (feature) {
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
  }

  submitHandler (event) {
    var notAdded = this.notAdded()
    if (notAdded.length) this.convertFeatures(notAdded)
    event.preventDefault()
    event.stopPropagation()
    this.props.onClose()
    return false
  }

  notAdded () {
    var features = this.props.features
    return features.filter(function (f) {
      return (f.ref === undefined && (f.properties && f.properties.element_id === undefined))
    })
  }

  render () {
    const { open, features, onClose } = this.props
    const { progress } = this.state

    if (!open) return <div />
    var percentage = Math.round((progress / features.length) * 100)
    var notAdded = this.notAdded()

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
                  variant='contained'
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

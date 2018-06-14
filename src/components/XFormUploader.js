import React from 'react'
import PropTypes from 'prop-types'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import Button from 'material-ui/Button'
import { CircularProgress } from 'material-ui/Progress'
import CheckCircleIcon from 'material-ui-icons/CheckCircle'
import WarningIcon from 'material-ui-icons/Warning'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Collapse from 'material-ui/transitions/Collapse'
import { withStyles } from 'material-ui/styles'
import { green, red } from 'material-ui/colors'

import { defineMessages, FormattedMessage } from 'react-intl'
import dragDrop from 'drag-drop'
import traverse from 'traverse'
import Uploader from 'xform-uploader'
import clone from 'clone'
import glob from 'glob'
import fs from 'fs'
import path from 'path'

const noop = () => null

const styles = {
  root: {
    '.drag &': {
      outline: '3px solid blue'
    }
  },
  button: {
    marginLeft: 12,
    float: 'right'
  },
  body: {
    marginBottom: 12,
    minHeight: 200,
    display: 'flex'
  },
  card: {
    maxHeight: '100%',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  cardContainerStyle: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex'
  },
  cardText: {
    overflow: 'auto'
  },
  header: {
    lineHeight: '22px',
    boxSizing: 'content-box',
    borderBottom: '1px solid #cccccc'
  },
  uploadBox: {
    flex: 1,
    backgroundColor: '#eee',
    border: '2px dashed #aaa',
    color: '#aaa',
    textAlign: 'center',
    padding: '12px 12px',
    '.drag &': {
      backgroundColor: '#CFD8DC'
    }
  },
  uploadBoxText: {
    fontWeight: 'bold',
    marginBottom: 24
  },
  fileInput: {
    display: 'none'
  }
}

const messages = defineMessages({
  dragHere: {
    id: 'upload.dragHere',
    defaultMessage: 'Drag files or folders here',
    description: 'Drag target when uploading forms'
  },
  selectFolder: {
    id: 'upload.selectFolder',
    defaultMessage: 'Select folder from your computer',
    description: 'Button text to select folder from computer for upload'
  },
  addFiles: {
    id: 'upload.addFiles',
    defaultMessage: 'Add more files',
    description: 'Button text to add more files to upload'
  },
  pendingForms: {
    id: 'upload.pendingForms',
    defaultMessage: 'Forms',
    description: 'Subheader text when listing forms available to upload'
  },
  missingAttachments: {
    id: 'upload.missingAttachments',
    defaultMessage: 'Missing Attachments',
    description: 'Subheader text when listing attachments that are missing from pending forms'
  },
  upload: {
    id: 'upload.upload',
    defaultMessage: 'Upload',
    description: 'Button text when uploading forms'
  },
  cancel: {
    id: 'upload.cancel',
    defaultMessage: 'Cancel',
    description: 'Upload form cancel button text'
  },
  uploadFormData: {
    id: 'upload.uploadFormData',
    defaultMessage: 'Add Form Data',
    description: 'Dialog title text when allowing users to upload form data'
  }
})

class FormListItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {open: true}
  }

  handleClick = () => {
    this.setState({open: !this.state.open})
  }

  render () {
    const {form} = this.props
    const missing = form.missingAttachments
    return <div>
      <ListItem
        button={missing.length > 0}
        onClick={this.handleClick}>
        <ListItemIcon>
          {missing.length
          ? <WarningIcon style={{color: red[500]}} />
          : <CheckCircleIcon style={{color: green[500]}} />}
        </ListItemIcon>
        <ListItemText primary={form.name} />
        {missing.length > 0 && (this.state.open ? <ExpandLess /> : <ExpandMore />)}
      </ListItem>
      <Collapse in={missing.length > 0 && this.state.open} unmountOnExit>
        {missing.map((a, idx) => (
          <ListItem key={idx}>
            <ListItemText inset primary={<span>Missing <code>{a}</code></span>} />
          </ListItem>
        ))}
      </Collapse>
    </div>
  }
}

const FormList = ({forms}) => (
  <List>
    {forms.map((form, idx) => <FormListItem form={form} key={idx} />)}
  </List>
)

const UploadButton = ({uploading, onClick, disabled}) => (
  <Button
    variant='raised'
    color='primary'
    onClick={uploading ? noop : onClick}
    disabled={disabled}>
    <FormattedMessage {...messages.upload} />
  </Button>
)

const CancelButton = ({onClick}) => (
  <Button
    variant='raised'
    onClick={onClick}>
    <FormattedMessage {...messages.cancel} />
  </Button>
)

const DragDropArea = ({onChange, classes}) => (
  <div className={classes.uploadBox}>
    <DialogContentText className={classes.uploadBoxText}>
      <FormattedMessage {...messages.dragHere} />
    </DialogContentText>
    <DialogContentText className={classes.uploadBoxText}>— or —</DialogContentText>
    <SelectFolderButton
      directory
      variant='raised'
      classes={classes}
      onChange={onChange}>
      <FormattedMessage {...messages.selectFolder} />
    </SelectFolderButton>
  </div>
)

class SelectFolderButton extends React.Component {
  componentDidMount () {
    if (!this.props.directory) return
    this.fileInput.webkitdirectory = true
    this.fileInput.directory = true
    this.fileInput.mozdirectory = true
  }

  render () {
    const {children, raised, onChange, disabled, classes} = this.props
    return <div>
      <input
        className={classes.fileInput}
        ref={el => (this.fileInput = el)}
        type='file'
        id='file'
        onChange={onChange}
        multiple />
      <label htmlFor='file'>
        <Button
          variant={raised ? 'raised' : 'flat'}
          component='span'
          className={classes.selectFolderButton}
          disabled={disabled}>
          {children}
        </Button>
      </label>
    </div>
  }
}

class XFormUploader extends React.Component {
  constructor (props) {
    super(props)
    this.uploader = new Uploader()
      .on('change', () => {
        this.setState(this.uploader.state())
      })
    this.state = this.uploader.state()
  }

  uploadForms = () => {
    // trigger progress spinner
    this.setState({uploading: true})
    const {uploadForm, uploadFile} = this.props
    const {forms} = this.state

    Promise
      .all(forms.map(processForm))
      .then(this.onUploadSuccess.bind(this))
      .catch(this.onUploadFailure.bind(this))

    function processForm (form) {
      const formData = clone(form.data)
      return Promise
        .all(form.attachments.map(processAttachment))
        .then(() => uploadForm(formData))

      function processAttachment (attachment) {
        const filename = formData.id + '/' + attachment.name
        return uploadFile(attachment.blob, filename)
          .then(url => replaceValue(formData.properties, attachment.name, url))
      }
    }
  }

  onUploadFailure (err) {
    this.resetUploader()
    this.props.onUpload(err)
    this.props.onRequestClose()
  }

  onUploadSuccess (uploadedForms) {
    this.resetUploader()
    this.props.onUpload(null, uploadedForms)
    this.props.onRequestClose()
  }

  // There is a bug in Electron with file inputs and webkitDirectory
  // https://github.com/electron/electron/issues/839
  // It returns a single empty File with the absolute path of the selected directory
  // This override reconstructs the Filelist that xformUploader expects
  handleFiles = (e) => {
    if (this.state.uploading) return
    const files = e.target.files
    if (files.length && files[0].type) {
      this.uploader.add(toArray(files), err => err && console.error(err))
      return
    }
    glob('**/*', {cwd: e.target.files[0].path, nodir: true, absolute: true}, (err, filepaths) => {
      if (err) return console.error(err)
      filepaths.forEach(filepath => {
        const parsed = path.parse(filepath)
        const isXml = parsed.ext === '.xml'
        fs.readFile(filepath, isXml ? 'utf8' : null, (err, data) => {
          if (err) return console.error(err)
          const file = new File([data], parsed.base)
          this.uploader.add(file, err => err && console.error(err))
        })
      })
    })
  }

  // handleFiles = (e) => {
  //   if (this.state.uploading) return
  //   console.log(e.target.files)
  //   const files = toArray(e.target.files)
  //   this.uploader.add(files, err => err && console.error(err))
  // }

  resetUploader () {
    this.setState({uploading: false})
    this.uploader = new Uploader()
      .on('change', () => {
        this.setState(this.uploader.state())
      })
    this.setState(this.uploader.state())
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.open) return
    if (!nextProps.open) return
    // Reset uploader if was closed and now open
    this.resetUploader()
  }

  componentDidMount () {
    this.removeDragDrop = dragDrop(window.document.body, files => {
      this.uploader.add(files, err => {
        if (err) console.error(err.stack)
      })
    })
  }

  componentWillUnmount () {
    this.removeDragDrop()
  }

  render () {
    const { open, onRequestClose, classes } = this.props
    const { forms, uploading } = this.state
    return (
      <Dialog
        classes={{paper: classes.root}}
        open={open}
        fullWidth
        onClose={onRequestClose}>
        <DialogTitle>
          <FormattedMessage {...messages.uploadFormData} />
        </DialogTitle>
        <DialogContent>
          <div className={classes.body}>
            {forms.length === 0
              ? <DragDropArea onChange={this.handleFiles} classes={classes} />
              : <FormList forms={forms} />
            }
          </div>
        </DialogContent>
        <DialogActions>
          {forms.length > 0 &&
            <SelectFolderButton
              classes={classes}
              onChange={this.handleFiles}
              disabled={uploading}>
              <FormattedMessage {...messages.addFiles} />
            </SelectFolderButton>
          }
          <CancelButton onClick={onRequestClose} disabled={uploading} />
          <UploadButton
            onClick={this.uploadForms}
            uploading={uploading}
            disabled={forms.length === 0 || uploading} />
        </DialogActions>
      </Dialog>
    )
  }
}

XFormUploader.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  uploadForm: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired
}

XFormUploader.defaultProps = {
  onUpload: () => null
}

function replaceValue (obj, oldValue, newValue) {
  traverse(obj).forEach(function (value) {
    if (oldValue !== value) return
    this.update(newValue)
  })
}

module.exports = withStyles(styles)(XFormUploader)

function toArray (list) {
  return Array.prototype.slice.call(list || [], 0)
}


/* global File */
// const XFormUploader = require('react-xform-uploader')
// const glob = require('glob')
// const fs = require('fs')
// const path = require('path')

// // There is a bug in Electron with file inputs and webkitDirectory
// // https://github.com/electron/electron/issues/839
// // It returns a single empty File with the absolute path of the selected directory
// // This override reconstructs the Filelist that xformUploader expects
// XFormUploader.prototype.handleFiles = function (e) {
//   if (this.state.uploading) return
//   glob('**/*', {cwd: e.target.files[0].path, nodir: true, absolute: true}, (err, filepaths) => {
//     if (err) return console.error(err)
//     filepaths.forEach(filepath => {
//       const parsed = path.parse(filepath)
//       const isXml = parsed.ext === '.xml'
//       fs.readFile(filepath, isXml ? 'utf8' : null, (err, data) => {
//         if (err) return console.error(err)
//         const file = new File([data], parsed.base)
//         this.uploader.add(file, err => err && console.error(err))
//       })
//     })
//   })
// }

// module.exports = XFormUploader

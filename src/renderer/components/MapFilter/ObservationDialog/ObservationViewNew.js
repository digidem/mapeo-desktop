import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
// import clone from 'clone-deep'

import { getFields as defaultGetFieldsFromTags } from '../lib/data_analysis'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'green'
  },
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  contents: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  media: {
    flex: 1,
    backgroundColor: 'aqua',
    flexBasis: '67%',
    maxWidth: '67%',
    position: 'relative'
  },
  details: {
    flex: 1,
    minWidth: 320,
    flexBasis: '33%',
    backgroundColor: 'white',
    overflowY: 'scroll'
  }
}))

function defaultGetFields (obs) {
  return defaultGetFieldsFromTags(obs.tags)
}

const ObservationView = ({
  onRequestClose,
  observation,
  getFields = defaultGetFields,
  getName = () => 'Observation',
  getMedia
}) => {
  const classes = useStyles()
  const [editing, setEditing] = React.useState(false)
  // const [draftTags, setTags] = React.useState(() =>
  //   clone(observation.tags || {})
  // )

  function handleSave () {
    setEditing(false)
  }

  // function handleChange(newTags) {
  //   setTags(newTags)
  // }

  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            onClick={onRequestClose}
            aria-label='Close'
          >
            <CloseIcon />
          </IconButton>
          <Typography variant='h6' className={classes.title}>
            Observation
          </Typography>
          {editing ? (
            <>
              <Button color='inherit' onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button color='inherit' onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <Button color='inherit' onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <div className={classes.contents}>
        <div className={classes.media}></div>
        <div className={classes.details}>Hello world</div>
      </div>
    </div>
  )
}

export default ObservationView

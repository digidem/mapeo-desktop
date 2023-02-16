import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    zIndex: 10,
    top: 0,
    left: 0,
    right: 0,
    padding: '8px !important',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    '& > *': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      '&:first-child': {
        justifyContent: 'flex-start'
      },
      '&:last-child': {
        justifyContent: 'flex-end'
      }
    }
  }
})

const Toolbar = ({ children }) => {
  const classes = useStyles()
  return (
    <AppBar
      elevation={0}
      color='default'
      position='static'
      className={classes.root}
    >
      {children}
    </AppBar>
  )
}

export default Toolbar

// @flow

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
    flexDirection: 'row !important',
    justifyContent: 'space-between'
  }
})

type Props = {
  children: React.Node
}

const Toolbar = ({ children }: Props) => {
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

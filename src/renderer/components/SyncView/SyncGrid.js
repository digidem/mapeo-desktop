import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const SyncGrid = ({ children }) => {
  const cx = useStyles()
  return <div className={cx.root}>{children}</div>
}

export default SyncGrid

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    overflowY: 'scroll',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    alignItems: 'start',
    alignContent: 'start',
    gridGap: 30,
    padding: 20,
    flex: 1
  }
}))

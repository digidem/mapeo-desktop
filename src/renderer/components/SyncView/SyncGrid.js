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
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    alignItems: 'start',
    alignContent: 'start',
    gridGap: 30,
    padding: 20,
    backgroundColor: '#F6F6F6',
    flex: 1
  }
}))

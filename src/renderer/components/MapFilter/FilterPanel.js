import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import MuiToolbar from '@material-ui/core/Toolbar'
import { FilterPanel } from 'react-mapfilter'
import { defineMessages, FormattedMessage } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles'

import { Typography } from '@material-ui/core'

const m = defineMessages({
  filterHeader: 'Filter by…'
})

const LeftPanel = props => {
  const cx = useStyles()
  return (
    <div className={cx.root}>
      <AppBar
        color='inherit'
        position='static'
        elevation={0}
        className={cx.header}
      >
        <MuiToolbar>
          <Typography variant='h6' component='h2'>
            <FormattedMessage {...m.filterHeader} />
          </Typography>
        </MuiToolbar>
      </AppBar>
      <FilterPanel {...props} />
    </div>
  )
}

export default LeftPanel

const useStyles = makeStyles({
  root: {
    flex: 0,
    flexBasis: '30%',
    minWidth: 300,
    maxWidth: 400,
    flexDirection: 'column',
    display: 'flex',
    backgroundColor: 'white',
    '@media only print': {
      display: 'none'
    }
  },
  header: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    color: 'rgba(0, 0, 0, 0.7)'
  }
})

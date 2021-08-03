import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

export default ({ text, icon }) => {
  const cx = useStyles()
  return (
    <div className={cx.root}>
      <div className={cx.container}>
        {icon}
        <div className={cx.text}>
          <Typography gutterBottom variant='h2' className={cx.title}>
            {text}
          </Typography>
        </div>
      </div>
    </div>
  )
}

const useStyles = makeStyles(theme => ({
  text: {
    maxWidth: 300,
    marginLeft: theme.spacing(2)
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    alignSelf: 'stretch',
    justifySelf: 'stretch'
  },
  container: {
    color: '#00052b',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  title: {
    fontSize: '2em',
    fontWeight: 400
  }
}))

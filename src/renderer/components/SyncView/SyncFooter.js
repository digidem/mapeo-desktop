import React, { useEffect, useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import api from '../../new-api'

const visibleKeyLength = 5

const SyncFooter = () => {
  const cx = useStyles()
  const [encryptionKey, setEncryptionKey] = useState(null)

  // Check encryption key on load
  useEffect(() => {
    const check = async () => {
      const encryptionKey = await api.getEncryptionKey()
      setEncryptionKey(encryptionKey)
    }
    check()
  }, [])

  return (
    <AppBar position='static' color='default' elevation={0} className={cx.root}>
      <Toolbar>
        <div className={cx.titleBar}>
          <Typography component='h2' className={cx.title}>
            {encryptionKey
             ? `${encryptionKey.slice(0, visibleKeyLength)}${'*'.repeat(encryptionKey.length - visibleKeyLength)}`
             : ''}
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default SyncFooter

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'white'
  },
  titleBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  title: {
    color: 'black'
  }
}))

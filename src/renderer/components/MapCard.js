import * as React from 'react'
import Button from '@material-ui/core/Button'

import { makeStyles } from '@material-ui/core'

export const MapCard = ({ setMap }) => {
  const classes = useStyles()
  return (
    <Button variant='outlined' className={classes.container}>
      Build Map Card Here
    </Button>
  )
}

const useStyles = makeStyles({
  container: {
    height: 90,
    width: '90%',
    marginBottom: 20,
    textTransform: 'none'
  }
})

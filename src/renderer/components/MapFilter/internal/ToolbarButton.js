//
import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles({
  root: {
    color: 'rgba(0, 0, 0, 0.67)',
    textTransform: 'initial',
    '&:not(:last-child)': {
      marginRight: 10
    }
  }
})

const ToolbarButton = ({ children, ...otherProps }) => {
  const classes = useStyles()
  return (
    <Button className={classes.root} {...otherProps}>
      {children}
    </Button>
  )
}

ToolbarButton.muiName = 'Button'

export default ToolbarButton

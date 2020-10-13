// @flow
import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles({
  root: {
    color: 'rgba(0, 0, 0, 0.67)',
    padding: '3px 5px',
    marginRight: 5,
    minHeight: 16,
    textTransform: 'initial',
    '& svg': {
      height: 18,
      width: 18,
      paddingRight: 6
    }
  }
})

type Props = {
  children: React.Node
}

const ToolbarButton = ({ children, ...otherProps }: Props) => {
  const classes = useStyles()
  return (
    <Button className={classes.root} {...otherProps}>
      {children}
    </Button>
  )
}

ToolbarButton.muiName = 'Button'

export default ToolbarButton

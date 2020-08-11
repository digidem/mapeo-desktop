// @flow
import * as React from 'react'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import Popover from '@material-ui/core/Popover'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, FormattedMessage } from 'react-intl'

import ToolbarButton from '../internal/ToolbarButton'
import type { FieldState } from '../types'
const msgs = defineMessages({
  // Button label for hide fields menu
  hideFieldsLabel: `{count} Hidden Fields`,
  // Show all fields in report view
  showAll: 'Show All',
  // Hide all fields in report view
  hideAll: 'Hide All'
})

const useStyles = makeStyles(theme => {
  return {
    actions: {
      margin: `${theme.spacing(1)}px ${theme.spacing(1) / 2}px`
    },
    button: {
      margin: `0 ${theme.spacing(1) / 2}px`
    },
    listItem: {
      paddingRight: 48
    },
    fieldname: {
      maxWidth: 300,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    }
  }
})

type Props = {|
  fieldState: FieldState,
  onFieldStateUpdate: FieldState => any
|}

const HideFieldsButton = ({ fieldState, onFieldStateUpdate }: Props) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function toggleFieldVisibility(id: string) {
    const newState = fieldState
      .slice()
      .map(f => (f.id === id ? { ...f, hidden: !f.hidden } : f))
    onFieldStateUpdate(newState)
  }

  function showAllFields() {
    const newState = fieldState.slice().map(f => ({ ...f, hidden: false }))
    onFieldStateUpdate(newState)
  }

  function hideAllFields() {
    const newState = fieldState.slice().map(f => ({ ...f, hidden: true }))
    onFieldStateUpdate(newState)
  }

  const open = Boolean(anchorEl)

  const hiddenCount = fieldState.filter(f => f.hidden).length
  console.log('hiddenCount', hiddenCount)
  return (
    <React.Fragment>
      <ToolbarButton onClick={handleClick}>
        <VisibilityOffIcon />
        <FormattedMessage
          {...msgs.hideFieldsLabel}
          values={{ count: hiddenCount }}
        />
      </ToolbarButton>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '50vh',
            minWidth: 200,
            maxWidth: '50vw'
          }
        }}>
        <div className={classes.actions}>
          <Button
            size="small"
            onClick={showAllFields}
            className={classes.button}>
            <FormattedMessage {...msgs.showAll} />
          </Button>
          <Button
            size="small"
            onClick={hideAllFields}
            className={classes.button}>
            <FormattedMessage {...msgs.hideAll} />
          </Button>
        </div>
        <List dense>
          {fieldState.map(f => (
            <ListItem key={f.id} className={classes.listItem}>
              <ListItemText className={classes.fieldname} primary={f.label} />
              <ListItemSecondaryAction>
                <Switch
                  onClick={() => toggleFieldVisibility(f.id)}
                  checked={!f.hidden}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Popover>
    </React.Fragment>
  )
}

export default HideFieldsButton

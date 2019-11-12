import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ExportIcon from '@material-ui/icons/MoreVert'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

const m = defineMessages({
  exportButton: 'Export Observation Data',
  exportMap: 'Export Webmap…',
  exportData: 'Export Observations…'
})

const ExportButton = ({ onExport }) => {
  const { formatMessage: t } = useIntl()
  const [menuAnchor, setMenuAnchor] = React.useState(null)

  const handleExportClick = event => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuItemClick = id => () => {
    setMenuAnchor(null)
    if (id) onExport(id)
  }

  return (
    <>
      <Tooltip title={t(m.exportButton)}>
        <IconButton
          aria-label='export'
          color='inherit'
          onClick={handleExportClick}
          aria-controls='export-menu'
          aria-haspopup='true'
        >
          <ExportIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id='export-menu'
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuItemClick(null)}
      >
        <MenuItem onClick={handleMenuItemClick('map')}>
          <FormattedMessage {...m.exportMap} />
        </MenuItem>
        <MenuItem onClick={handleMenuItemClick('data')}>
          <FormattedMessage {...m.exportData} />
        </MenuItem>
      </Menu>
    </>
  )
}

export default ExportButton

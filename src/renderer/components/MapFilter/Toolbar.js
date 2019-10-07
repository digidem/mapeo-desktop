import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import MapIcon from '@material-ui/icons/Map'
import MediaIcon from '@material-ui/icons/Apps'
import ReportIcon from '@material-ui/icons/LibraryBooks'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import ExportIcon from '@material-ui/icons/SaveAlt'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import clsx from 'clsx'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import MapExportDialog from './MapExportDialog'
import GeoJsonExportDialog from './GeoJsonExportDialog'

const m = defineMessages({
  exportButton: 'Export data',
  mapTabLabel: 'Map',
  mediaTabLabel: 'Media',
  reportTabLabel: 'Report',
  exportMap: 'Export Webmap…',
  exportGeoJson: 'Export GeoJSON…'
})

const TabItem = ({ selected, ...props }) => {
  const cx = useStyles()
  return (
    <Button
      disableRipple
      {...props}
      className={clsx(cx.tabItem, selected && 'selected')}
    />
  )
}

const MapFilterToolbar = ({
  view,
  onChange,
  observations,
  filter,
  presets,
  getMediaUrl
}) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()
  const [dialog, setDialog] = useState(null)
  const [menuAnchor, setMenuAnchor] = React.useState(null)

  const handleExportClick = event => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuItemClick = id => () => {
    setMenuAnchor(null)
    setDialog(id)
  }

  const handleChange = view => e => onChange(view)
  return (
    <>
      <AppBar
        position='static'
        color='inherit'
        elevation={0}
        className={cx.root}
      >
        <Toolbar className={cx.toolbar}>
          <div className={cx.tabGroup}>
            <TabItem
              aria-label='map view'
              selected={view === 'map'}
              onClick={handleChange('map')}
            >
              <MapIcon />
              <span className={cx.tabLabel}>{t(m.mapTabLabel)}</span>
            </TabItem>
            <TabItem
              aria-label='media view'
              selected={view === 'media'}
              onClick={handleChange('media')}
            >
              <MediaIcon />
              <span className={cx.tabLabel}>{t(m.mediaTabLabel)}</span>
            </TabItem>
            <TabItem
              aria-label='report view'
              selected={view === 'report'}
              onClick={handleChange('report')}
            >
              <ReportIcon />
              <span className={cx.tabLabel}>{t(m.reportTabLabel)}</span>
            </TabItem>
          </div>
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
            keepMounted
            open={Boolean(menuAnchor)}
            onClose={handleMenuItemClick(null)}
          >
            <MenuItem onClick={handleMenuItemClick('map')}>
              <FormattedMessage {...m.exportMap} />
            </MenuItem>
            <MenuItem onClick={handleMenuItemClick('geojson')}>
              <FormattedMessage {...m.exportGeoJson} />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <MapExportDialog
        open={dialog === 'map'}
        onClose={() => setDialog(null)}
        observations={observations}
        filter={filter}
        presets={presets}
        getMediaUrl={getMediaUrl}
      />
      <GeoJsonExportDialog
        open={dialog === 'geojson'}
        onClose={() => setDialog(null)}
        observations={observations}
        filter={filter}
        presets={presets}
        getMediaUrl={getMediaUrl}
      />
    </>
  )
}

export default MapFilterToolbar

const useStyles = makeStyles(theme => ({
  root: {
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    '@media only print': {
      display: 'none'
    }
  },
  toolbar: {
    justifyContent: 'space-between'
  },
  tabItem: {
    height: '44px',
    flex: '1',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '0 16px 0 16px',
    justifyContent: 'stretch',
    textTransform: 'capitalize',
    '&.selected': {
      color: 'white',
      backgroundColor: '#2469f6 !important'
    },
    '&:not(:last-child)': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0'
    },
    '&:not(:first-child)': {
      borderLeft: '1px solid transparent',
      marginLeft: '-1px',
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0'
    },
    '& .MuiSvgIcon-root': {}
  },
  tab: {
    height: 44,
    flex: 1,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    textTransform: 'capitalize',
    color: 'rgba(0, 0, 0, 0.87)',
    justifyContent: 'stretch',
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: '#2469F6 !important'
    },
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1)
    }
  },
  tabIcon: {},
  tabLabel: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 500,
    flex: 1
  },
  tabGroup: {
    flex: 1,
    maxWidth: 350,
    display: 'inline-flex',
    borderRadius: '4px',
    backgroundColor: '#fff'
  },
  toolbarButton: {}
}))

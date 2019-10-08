import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { DialogContentText } from '@material-ui/core'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import fs from 'fs'
import path from 'path'
import { remote } from 'electron'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'

import ViewWrapper from 'react-mapfilter/commonjs/ViewWrapper'

const msgs = defineMessages({
  // Title for webmaps export dialog
  title: 'Export Observations to GeoJSON',
  // Save button
  save: 'Save',
  // cancel button
  cancel: 'Cancel',
  filteredOrAll: 'Export all observations or currently filtered data',
  exportAll: 'All {count} observations',
  exportFiltered: 'Only {count} currently filtered observations'
})

const GeoJsonExportDialogContent = ({
  open,
  filteredObservations = [],
  allObservations = [],
  getPreset,
  getMediaUrl,
  onClose
}) => {
  const classes = useStyles()
  const { formatMessage } = useIntl()
  const [saving, setSaving] = useState()
  const [value, setValue] = React.useState('all')

  const handleChange = event => {
    setValue(event.target.value)
  }
  // const [terms, setTerms] = useState()
  // const [mapStyle, setMapStyle] = useState(defaultMapStyle)

  const handleClose = () => {
    setSaving(false)
    // setTerms(undefined)
    // setMapStyle(defaultMapStyle)
    onClose()
  }

  const handleSave = e => {
    e.preventDefault()
    setSaving(true)

    const observationsToSave =
      value === 'all' ? allObservations : filteredObservations

    const features = observationsToSave.map(obs => ({
      type: 'Feature',
      geometry:
        obs.lat == null || obs.lon == null
          ? null
          : {
            type: 'Point',
            coordinates: [obs.lon, obs.lat]
          },
      id: obs.id,
      properties: {
        ...obs.tags,
        $created: obs.created_at,
        $modified: obs.timestamp,
        $version: obs.version
      }
    }))

    const geoJson = {
      type: 'FeatureCollection',
      features
    }

    remote.dialog.showSaveDialog(
      {
        title: 'Guardar GeoJSON',
        defaultPath: 'observations',
        filters: [{ extensions: ['geojson'] }]
      },
      filepath => {
        const filepathWithExtension = path.join(
          path.dirname(filepath),
          path.basename(filepath, '.geojson') + '.geojson'
        )
        fs.writeFile(
          filepathWithExtension,
          JSON.stringify(geoJson, null, 2),
          () => {
            handleClose()
          }
        )
      }
    )
  }

  const isFiltered = allObservations.length !== filteredObservations.length

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      scroll='body'
      aria-labelledby='responsive-dialog-title'
    >
      <form noValidate autoComplete='off'>
        <DialogTitle id='responsive-dialog-title' style={{ paddingBottom: 8 }}>
          <FormattedMessage {...msgs.title} />
        </DialogTitle>

        <DialogContent className={classes.content}>
          {isFiltered ? (
            <FormControl component='fieldset' className={classes.formControl}>
              <FormLabel component='legend'>
                <FormattedMessage {...msgs.filteredOrAll} />
              </FormLabel>
              <RadioGroup
                aria-label='export choice'
                name='export'
                value={value}
                onChange={handleChange}
              >
                <FormControlLabel
                  value='all'
                  control={<Radio />}
                  label={
                    <FormattedMessage
                      {...msgs.exportAll}
                      values={{ count: allObservations.length }}
                    />
                  }
                />
                <FormControlLabel
                  value='filtered'
                  control={<Radio />}
                  label={
                    <FormattedMessage
                      {...msgs.exportFiltered}
                      values={{ count: filteredObservations.length }}
                    />
                  }
                />
              </RadioGroup>
            </FormControl>
          ) : (
            <DialogContentText>
              {`Exportar ${
                allObservations.length
              } observaciones a un archivo GeoJSON`}
            </DialogContentText>
          )}
        </DialogContent>

        <DialogActions>
          <Button disabled={saving} onClick={handleClose}>
            {formatMessage(msgs.cancel)}
          </Button>
          <Button
            disabled={saving}
            onClick={handleSave}
            color='primary'
            variant='contained'
            type='submit'
          >
            {formatMessage(msgs.save)}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default function GeoJsonExportDialog ({
  observations,
  presets,
  filter,
  getMediaUrl,
  ...otherProps
}) {
  return (
    <ViewWrapper
      observations={observations}
      presets={presets}
      filter={filter}
      getMediaUrl={getMediaUrl}
    >
      {({ onClickObservation, filteredObservations, getPreset }) => (
        <GeoJsonExportDialogContent
          filteredObservations={filteredObservations}
          allObservations={observations}
          getPreset={getPreset}
          getMediaUrl={getMediaUrl}
          {...otherProps}
        />
      )}
    </ViewWrapper>
  )
}

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0
  }
}))

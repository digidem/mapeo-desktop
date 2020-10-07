import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import FormHelperText from '@material-ui/core/FormHelperText'
import { csvFormat } from 'd3-dsv'
import ViewWrapper from './ViewWrapper'
import flatten from 'flat'
import isodate from '@segment/isodate'
import { fromLatLon } from 'utm'
import { remote } from 'electron'
import path from 'path'
import fs from 'fs'
import fsWriteStreamAtomic from 'fs-write-stream-atomic'
import pump from 'pump'

import logger from '../../../logger'
import createZip from '../../create-zip'

const msgs = defineMessages({
  // Title for webmaps export dialog
  title: 'Export Observations',
  // Save button
  save: 'Save',
  // Close button (shown if user has no data to export)
  close: 'Close',
  // cancel button
  cancel: 'Cancel',
  // Label for data format selector
  format: 'Data format',
  // Label for select to export all data or only filtered
  filteredOrAll: 'Only filtered data or all data?',
  exportAll: 'All {count} observations',
  exportFiltered: '{count} filtered observations',
  // Shown when there is no data to export
  noData: "You don't yet have any data to export.",
  // Label for select to include photos in export
  includePhotos: 'Also export photos?',
  // Hint shown when user has selected photos to be included in the export
  includePhotosHint: 'Export will be a zip file including data and photos',
  // Label for select option to include no photos in export
  includePhotosNone: 'No Photos',
  // Label for select option to include full size photos in export
  includePhotosOriginal: 'Full size photos',
  // Label for select option to include preview size photos in export
  includePhotosPreview: 'Preview size photos',
  // Default filename for exported data
  defaultExportFilename: 'mapeo-observation-data'
})

const ExportDialogContent = ({
  filteredObservations = [],
  allObservations = [],
  getPreset,
  getMediaUrl,
  onClose
}) => {
  const classes = useStyles()
  const [saving, setSaving] = useState()
  const { formatMessage: t } = useIntl()
  const isFiltered = allObservations.length !== filteredObservations.length
  const [values, setValues] = React.useState({
    format: 'geojson',
    include: isFiltered && filteredObservations.length ? 'filtered' : 'all',
    photos: 'none'
  })

  const handleChange = key => event => {
    setValues(values => ({ ...values, [key]: event.target.value }))
  }

  const handleClose = () => {
    setSaving(false)
    onClose()
  }

  const handleSave = e => {
    e.preventDefault()
    setSaving(true)

    const observationsToSave =
      values.include === 'all' ? allObservations : filteredObservations

    let exportData
    let ext = values.format
    switch (values.format) {
      case 'geojson':
        exportData = observationsToGeoJson(observationsToSave, {
          photos: values.photos !== 'none'
        })
        break
      case 'csv':
        exportData = observationsToCsv(observationsToSave, {
          photos: values.photos !== 'none'
        })
        break
      case 'smart':
        ext = 'csv'
        exportData = observationsToSmartCsv(observationsToSave, {
          photos: values.photos !== 'none'
        })
        break
    }

    const saveExt = values.photos === 'none' ? ext : 'zip'
    remote.dialog
      .showSaveDialog({
        title: t(msgs.title),
        defaultPath: t(msgs.defaultExportFilename) + '.' + saveExt,
        filters: [{ name: saveExt + ' files', extensions: [saveExt] }]
      })
      .then(({ canceled, filePath }) => {
        if (canceled) return handleClose()
        const filepathWithExtension = path.join(
          path.dirname(filePath),
          path.basename(filePath, '.' + saveExt) + '.' + saveExt
        )
        onSelectFile(filepathWithExtension)
      })

    function onSelectFile (filePath) {
      if (values.photos === 'none') {
        fs.writeFile(filePath, exportData, err => {
          if (err) logger.error('DataExportDialog: onSelectFile', err)
          handleClose()
        })
        return
      }

      const photosToSave = []
      observationsToSave.forEach(o => {
        ;(o.attachments || []).forEach(a => {
          if (!photosToSave.includes(a.id)) photosToSave.push(a.id)
        })
      })

      const localFiles = [
        {
          data: exportData,
          metadataPath: t(msgs.defaultExportFilename) + '.' + ext
        }
      ]
      const remoteFiles = photosToSave.map(id => {
        // If the user is trying to export originals, use preview sized images
        // as a fallback. TODO: Show a warning to the user that originals are
        // missing and clearly explain why this might be and what the user can
        // do about it.
        const fallbackUrl =
          values.photos === 'original' ? getMediaUrl(id, 'preview') : undefined
        return {
          url: getMediaUrl(id, values.photos),
          fallbackUrl,
          metadataPath: 'images/' + id
        }
      })
      const output = fsWriteStreamAtomic(filePath)
      const archive = createZip(localFiles, remoteFiles)

      pump(archive, output, err => {
        if (err) logger.error('DataExportDialog: pump create zip', err)
        handleClose()
      })
    }
  }

  const noData = allObservations.length === 0

  return (
    <form noValidate autoComplete='off'>
      <DialogTitle id='responsive-dialog-title' style={{ paddingBottom: 8 }}>
        <FormattedMessage {...msgs.title} />
      </DialogTitle>

      <DialogContent className={classes.content}>
        {noData ? (
          <DialogContentText>
            <FormattedMessage {...msgs.noData} />
          </DialogContentText>
        ) : (
          <>
            <FormControl className={classes.formControl}>
              <InputLabel id='select-format-label'>
                <FormattedMessage {...msgs.format} />
              </InputLabel>
              <Select
                labelId='select-format-label'
                id='select-format'
                value={values.format}
                onChange={handleChange('format')}
                className={classes.select}
                disabled={saving}
              >
                <MenuItem value='geojson'>GeoJSON</MenuItem>
                <MenuItem value='csv'>CSV</MenuItem>
                <MenuItem value='smart'>Smart CSV</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel id='select-include-label'>
                <FormattedMessage {...msgs.filteredOrAll} />
              </InputLabel>
              <Select
                labelId='select-include-label'
                id='select-include'
                value={values.include}
                onChange={handleChange('include')}
                className={classes.select}
                disabled={saving}
              >
                <MenuItem value='all'>
                  <FormattedMessage
                    {...msgs.exportAll}
                    values={{ count: allObservations.length }}
                  />
                </MenuItem>
                <MenuItem
                  value='filtered'
                  disabled={!isFiltered || !filteredObservations.length}
                >
                  <FormattedMessage
                    {...msgs.exportFiltered}
                    values={{
                      count: isFiltered ? filteredObservations.length : 0
                    }}
                  />
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel id='select-photos-label'>
                <FormattedMessage {...msgs.includePhotos} />
              </InputLabel>
              <Select
                labelId='select-photos-label'
                id='select-photos'
                value={values.photos}
                onChange={handleChange('photos')}
                className={classes.select}
                disabled={saving}
              >
                <MenuItem value='none'>
                  <FormattedMessage {...msgs.includePhotosNone} />
                </MenuItem>
                <MenuItem value='original'>
                  <FormattedMessage {...msgs.includePhotosOriginal} />
                </MenuItem>
                <MenuItem value='preview'>
                  <FormattedMessage {...msgs.includePhotosPreview} />
                </MenuItem>
              </Select>
              {values.photos !== 'none' && (
                <FormHelperText>
                  <FormattedMessage {...msgs.includePhotosHint} />
                </FormHelperText>
              )}
            </FormControl>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {noData ? (
          <Button
            onClick={handleClose}
            color='primary'
            variant='contained'
            type='submit'
          >
            <FormattedMessage {...msgs.close} />
          </Button>
        ) : (
          <>
            <Button disabled={saving} onClick={handleClose}>
              <FormattedMessage {...msgs.cancel} />
            </Button>
            <Button
              disabled={saving}
              onClick={handleSave}
              color='primary'
              variant='contained'
              type='submit'
            >
              <FormattedMessage {...msgs.save} />
            </Button>
          </>
        )}
      </DialogActions>
    </form>
  )
}

export default function DataExportDialog ({
  observations,
  presets,
  filter,
  getMediaUrl,
  onClose,
  open,
  ...otherProps
}) {
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      scroll='body'
      aria-labelledby='responsive-dialog-title'
    >
      {open && (
        <ViewWrapper
          observations={observations}
          presets={presets}
          filter={filter}
          getMediaUrl={getMediaUrl}
        >
          {({ filteredObservations, getPreset }) => (
            <ExportDialogContent
              filteredObservations={filteredObservations}
              allObservations={observations}
              getPreset={getPreset}
              getMediaUrl={getMediaUrl}
              onClose={onClose}
              {...otherProps}
            />
          )}
        </ViewWrapper>
      )}
    </Dialog>
  )
}

function observationsToGeoJson (obs, { photos } = {}) {
  const features = obs.map(o => {
    const feature = {
      type: 'Feature',
      geometry:
        o.lat == null || o.lon == null
          ? null
          : {
              type: 'Point',
              coordinates: [o.lon, o.lat]
            },
      id: o.id,
      properties: {
        ...o.tags,
        $created: o.created_at,
        $modified: o.timestamp,
        $version: o.version
      }
    }
    if (photos && o.attachments && o.attachments.length) {
      feature.properties.$photos = o.attachments.map(a => a.id)
    }
    return feature
  })

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      features
    },
    null,
    2
  )
}

function observationsToCsv (obs, { photos } = {}) {
  const allKeys = {}
  const rows = obs.map(o => {
    const flattenedTags = flatten(o.tags)
    const parsedTags = {}

    Object.keys(flattenedTags).forEach(key => {
      const value = flattenedTags[key]
      // Remove unparsed objects (empty objects) from tags
      if (typeof value === 'object') return
      if (
        !(value == null || (typeof value === 'string' && value.length === 0))
      ) {
        // Only export columns for non-empty values
        allKeys[key] = true
      }
      if (typeof value === 'string' && isodate.is(value)) {
        // Convert ISO dates to a format that Excel can recognize in a CSV
        parsedTags[key] = formatCsvDatetime(value)
      } else {
        parsedTags[key] = value
      }
    })

    const hasLocation = o.lat != null && o.lon != null
    const { easting, northing, zoneNum, zoneLetter } = hasLocation
      ? fromLatLon(o.lat, o.lon)
      : {}
    const locationData = hasLocation && {
      // Round coordinates to 1cm precision
      $lon: round(o.lon, 7),
      $lat: round(o.lat, 7),
      $utmX: round(easting, 2),
      $utmY: round(northing, 2),
      $utmZone: zoneNum && zoneLetter ? zoneNum + zoneLetter : null
    }
    const $photos =
      photos && o.attachments && o.attachments.length
        ? o.attachments.map(a => a.id).join(',')
        : null

    return {
      ...parsedTags,
      $id: o.id,
      $created: formatCsvDatetime(o.created_at),
      $modified: o.timestamp && formatCsvDatetime(o.timestamp),
      $version: o.version,
      $photos,
      ...locationData
    }
  })

  // We do this to order the columns of the CSV, otherwise csvFormat column
  // order is non-deterministic
  const columns = [
    '$id',
    '$created',
    '$modified',
    '$lon',
    '$lat',
    '$utmX',
    '$utmY',
    '$utmZone',
    '$photos'
  ].concat(Object.keys(allKeys).sort(), '$version')

  return csvFormat(rows, columns)
}

function observationsToSmartCsv (obs, { photos } = {}) {
  const rows = obs.map((o, i) => {
    const locationData =
      o.lat != null && o.lon != null ? { X: o.lon, Y: o.lat } : {}
    const PHOTOS =
      photos && o.attachments && o.attachments.length
        ? o.attachments.map(a => a.id).join(',')
        : null

    return {
      ID: i + 1,
      MAPEO_ID: o.id,
      DATE: formatCsvDate(o.created_at),
      TIME: formatCsvTime(o.created_at),
      COMMENT: o.tags.notes || o.tags.note,
      PHOTOS,
      ...locationData
    }
  })

  // We do this to order the columns of the CSV, otherwise csvFormat column
  // order is non-deterministic
  const columns = 'ID,X,Y,DATE,TIME,COMMENT,PHOTOS,MAPEO_ID'.split(',')

  return csvFormat(rows, columns)
}

function round (num, dp = 0) {
  const factor = Math.pow(10, dp)
  return Math.round(num * factor) / factor
}

function formatCsvDatetime (isoDateString) {
  return formatCsvDate(isoDateString) + ' ' + formatCsvTime(isoDateString)
}

function formatCsvDate (isoDateString) {
  const date = new Date(isoDateString)
  const YYYY = date.getFullYear()
  const MM = leftPad(date.getMonth() + 1, 2)
  const DD = leftPad(date.getDate(), 2)
  return `${YYYY}-${MM}-${DD}`
}

function formatCsvTime (isoDateString) {
  const date = new Date(isoDateString)
  const hh = leftPad(date.getHours(), 2)
  const mm = leftPad(date.getMinutes(), 2)
  const ss = leftPad(date.getSeconds(), 2)
  return `${hh}:${mm}:${ss}`
}

function leftPad (num, len, char = 0) {
  const str = num + ''
  // doesn't need to pad
  len = len - str.length
  if (len <= 0) return str

  var pad = ''
  while (true) {
    if (len & 1) pad += char
    len >>= 1
    if (len) char += char
    else break
  }
  return pad + str
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
  },
  formControl: {
    marginBottom: theme.spacing(2),
    '&:not(:last-child)': {
      marginBottom: theme.spacing(4)
    }
  },
  select: {
    fontFamily: theme.typography.body1.fontFamily
  }
}))

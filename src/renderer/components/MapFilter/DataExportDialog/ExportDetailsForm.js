import * as React from 'react'
import * as remote from '@electron/remote'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'
import isodate from '@segment/isodate'
import { csvFormat } from 'd3-dsv'
import flatten from 'flat'
const fs = require('fs')
import fsWriteStreamAtomic from 'fs-write-stream-atomic'
const path = require('path')
import pump from 'pump'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import { fromLatLon } from 'utm'

import logger from '../../../../logger'
import createZip from '../../../create-zip'
import { Template } from './Template'

const msgs = defineMessages({
  // Title for export dialog
  title: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.title',
    defaultMessage: 'Export Observations'
  },
  // Save button
  save: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.save',
    defaultMessage: 'Save'
  },
  // cancel button
  cancel: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.cancel',
    defaultMessage: 'Cancel'
  },
  // Label for data format selector
  format: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.format',
    defaultMessage: 'Data format'
  },
  // Label for select to export all data or only filtered
  filteredOrAll: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.filteredOrAll',
    defaultMessage: 'Only filtered data or all data?'
  },
  exportAll: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.exportAll',
    defaultMessage: 'All {count} observations'
  },
  exportFiltered: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.exportFiltered',
    defaultMessage: '{count} filtered observations'
  },
  // Label for select to include photos in export
  includePhotos: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.includePhotos',
    defaultMessage: 'Also export photos?'
  },
  // Hint shown when user has selected photos to be included in the export
  includePhotosHint: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.includePhotosHint',
    defaultMessage: 'Export will be a zip file including data and photos'
  },
  // Label for select option to include no photos in export
  includePhotosNone: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.includePhotosNone',
    defaultMessage: 'No Photos'
  },
  // Label for select option to include full size photos in export
  includePhotosOriginal: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.includePhotosOriginal',
    defaultMessage: 'Full size photos'
  },
  // Label for select option to include preview size photos in export
  includePhotosPreview: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.includePhotosPreview',
    defaultMessage: 'Preview size photos'
  },
  // Default filename for exported data
  defaultExportFilename: {
    id: 'renderer.components.MapFilter.DataExportDialog.ExportDetailsForm.defaultExportFilename',
    defaultMessage: 'mapeo-observation-data'
  }
})

export const ExportDetailsForm = ({
  allObservations,
  filteredObservations,
  getMediaUrl,
  onClose,
  onSuccess
}) => {
  const { formatMessage: t } = useIntl()
  const classes = useStyles()

  const isFiltered = allObservations.length !== filteredObservations.length

  const [saving, setSaving] = React.useState(false)
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

  const handleSave = event => {
    event.preventDefault()

    setSaving(true)

    const observationsToSave =
      values.include === 'all' ? allObservations : filteredObservations

    let dataToExport
    let ext = values.format

    switch (values.format) {
      case 'geojson':
        dataToExport = observationsToGeoJson(observationsToSave, {
          photos: values.photos !== 'none'
        })
        break
      case 'csv':
        dataToExport = observationsToCsv(observationsToSave, {
          photos: values.photos !== 'none'
        })
        break
      case 'smart':
        ext = 'csv'
        dataToExport = observationsToSmartCsv(observationsToSave, {
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
        if (canceled) {
          handleClose()
          return
        }

        const filepathWithExtension = path.join(
          path.dirname(filePath),
          path.basename(filePath, '.' + saveExt) + '.' + saveExt
        )

        exportData(filepathWithExtension)
      })

    function exportData (filePath) {
      if (values.photos === 'none') {
        fs.writeFile(filePath, dataToExport, onFinish('onSelectFile'))
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
          data: dataToExport,
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
      const archive = createZip(localFiles, remoteFiles, { formatMessage: t })

      pump(archive, output, onFinish('pump create zip'))

      function onFinish (namespace) {
        return function (err) {
          if (err) {
            logger.error(`ExportDetailsForm: ${namespace}`, err)
            handleClose()
          } else {
            onSuccess()
          }
        }
      }
    }
  }

  return (
    <form noValidate autoComplete='off' onSubmit={handleSave}>
      <Template
        actions={
          <>
            <Button disabled={saving} onClick={handleClose} type='button'>
              <FormattedMessage {...msgs.cancel} />
            </Button>
            <Button
              disabled={saving}
              color='primary'
              variant='contained'
              type='submit'
            >
              <FormattedMessage {...msgs.save} />
            </Button>
          </>
        }
        content={
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
        }
      />
    </form>
  )
}

const useStyles = makeStyles(theme => ({
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

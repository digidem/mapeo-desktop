import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ipcRenderer } from 'electron'
import debounce from 'lodash/debounce'
import { defineMessages, FormattedMessage } from 'react-intl'
import mapboxgl from 'mapbox-gl'
import ErrorBoundary from 'react-error-boundary'
import Typography from '@material-ui/core/Typography'

import logger from '../../../logger'
import Toolbar from './Toolbar'
import FilterPanel from './FilterPanel'
import Loading from '../Loading'
import MapStyleProvider from './MapStyleProvider'
import api from '../../new-api'
import MapExportDialog from './MapExportDialog'
import { DataExportDialog } from './DataExportDialog'
import ExportButton from './ExportButton'
import MapView from './MapView'
import ReportView from './ReportView'
import MediaView from './MediaView'
import config from '../../../../config'

const m = defineMessages({
  errorTitle: {
    id: 'renderer.components.MapFilter.MapFilter.errorTitle',
    defaultMessage: 'Oh dear! An error has occurred'
  },
  errorDescription: {
    id: 'renderer.components.MapFilter.MapFilter.errorDescription',
    defaultMessage:
      'The details below will be useful for finding a way to fix this…'
  }
})

// This is very strange. Something to do with the bundling is stopping this
// being set from within the react-mapbox-gl library. We need to set this here
// to force mapbox to understand the accessToken is set
const MAPBOX_ACCESS_TOKEN = (mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN)

/**
 * Using normal state for this causes performance issues because it causes React
 * to re-render. Using a ref allows us to store position between tabs without re-renders
 */
function usePositionRef () {
  const key = 'mapFilterPosition'
  const savedPosition = useMemo(() => {
    try {
      const item = window.localStorage.getItem(key)
      return JSON.parse(item)
    } catch (e) {}
  }, [])

  const position = useRef(savedPosition)

  const persistPosition = useMemo(
    () =>
      debounce(() => {
        if (!position.current) return
        const item = JSON.stringify(position.current)
        window.localStorage.setItem(key, item)
      }, 500),
    []
  )

  const setPosition = useCallback(
    pos => {
      position.current = pos
      persistPosition()
    },
    [persistPosition]
  )

  return useMemo(() => [position, setPosition], [setPosition])
}

const MyFallbackComponent = ({ componentStack, error }) => {
  const cx = useStyles()
  return (
    <div className={cx.errorFallback}>
      <Typography variant='h4' component='h1'>
        <FormattedMessage {...m.errorTitle} />
      </Typography>
      <Typography>
        <FormattedMessage {...m.errorDescription} />
      </Typography>
      <br />
      <Typography variant='h6' component='h2'>
        Error:
      </Typography>
      <Typography>{error.toString()}</Typography>
      <Typography variant='h6' component='h2'>
        Stacktrace:
      </Typography>
      <pre>{componentStack}</pre>
    </div>
  )
}

const FilterView = ({ view, ...props }) => {
  const cx = useStyles()
  const mapRef = useRef()

  useEffect(() => {
    function zoomToData (_, loc) {
      if (!mapRef.current || typeof mapRef.current.flyTo !== 'function') return
      mapRef.current.flyTo({
        center: loc,
        zoom: 14
      })
    }
    ipcRenderer.on('zoom-to-data-observation', zoomToData)
    return () => {
      ipcRenderer.removeListener('zoom-to-data-observation', zoomToData)
    }
  }, [])

  return (
    <div className={cx.viewWrapper}>
      <ErrorBoundary FallbackComponent={MyFallbackComponent}>
        {view === 'report' ? (
          <ReportView {...props} />
        ) : view === 'media' ? (
          <MediaView {...props} />
        ) : (
          <MapView ref={mapRef} {...props} />
        )}
      </ErrorBoundary>
    </div>
  )
}

function usePresets () {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [presets, setPresets] = useState([])
  const [fields, setFields] = useState([])

  useEffect(() => {
    async function getPresets () {
      try {
        const data = await api.getPresets()
        const presets = mapToArray(data.presets)
          // Only point data is shown in the Observation view, so only show
          // presets which match point data
          .filter(p => p.geometry.includes('point'))
        const usedFields = new Set()
        for (const preset of presets) {
          if (!Array.isArray(preset.fields)) continue
          for (const fieldId of preset.fields) {
            usedFields.add(fieldId)
          }
        }
        const fields = mapToArray(data.fields)
          // Only show fields which are used in a preset
          .filter(field => usedFields.has(field.id))
        const presetsWithFields = presets
          // Replace field ids with full field definitions
          .map(p => addFieldDefinitions(p, fields))
        setLoading(false)
        setPresets(presetsWithFields)
        setFields(fields)
      } catch (e) {
        logger.error('MapFilter get Presets', e)
        setLoading(false)
        setError(e)
      }
    }
    getPresets()
  }, [])

  return useMemo(() => ({ presets, fields, error, loading }), [
    presets,
    fields,
    error,
    loading
  ])
}

function useObservations () {
  const isMounted = useRef(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [observations, setObservations] = useState([])

  const updateObservation = useCallback(
    observation => {
      api
        .updateObservation(observation.id, observation)
        .then(obs => {
          const index = observations.findIndex(o => o.id === obs.id)
          const updatedObservations =
            index > -1
              ? [
                  ...observations.slice(0, index),
                  obs,
                  ...observations.slice(index + 1)
                ]
              : [...observations, obs]
          setObservations(updatedObservations)
        })
        .catch(err => {
          logger.error('error updating observations', err)
        })
    },
    [observations]
  )

  const deleteObservation = useCallback(
    id => {
      api
        .deleteObservation(id)
        .then(() => {
          const index = observations.findIndex(o => o.id === id)
          if (index === -1) throw new Error('Observation not found')
          const updatedObservations = [
            ...observations.slice(0, index),
            ...observations.slice(index + 1)
          ]
          setObservations(updatedObservations)
        })
        .catch(err => {
          logger.error('error deleting observation', err)
        })
    },
    [observations]
  )

  function loadObservations () {
    api
      .getObservations()
      .then(obs => {
        if (!isMounted.current) return
        setObservations(obs)
        setLoading(false)
      })
      .catch(err => {
        if (!isMounted.current) return
        setError(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    const subscription = api.addDataChangedListener('territory-edit', () => {
      loadObservations()
    })
    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    loadObservations()
    return () => (isMounted.current = false)
  }, [])

  return useMemo(
    () => [
      { loading, error, observations },
      { updateObservation, deleteObservation }
    ],
    [loading, error, observations, updateObservation, deleteObservation]
  )
}

const MapFilter = () => {
  const cx = useStyles()
  const [view, setView] = useState('map')
  const [filter, setFilter] = useState(null)
  const [position, setPosition] = usePositionRef()
  const [dialog, setDialog] = useState(null)

  const [
    { observationsLoading, observationsError, observations },
    { updateObservation, deleteObservation }
  ] = useObservations()
  const {
    presets,
    fields,
    error: presetsError,
    loading: presetsLoading
  } = usePresets()

  if (observationsLoading || presetsLoading) {
    return (
      <div className={cx.root}>
        <Loading />
      </div>
    )
  }

  if (observationsError) logger.error('observationsError', observationsError)
  if (presetsError) logger.error('presetsError', presetsError)

  return (
    <div className={cx.root}>
      <FilterPanel
        observations={observations}
        filter={filter}
        onChangeFilter={setFilter}
        presets={presets}
        fields={fields}
      />
      <div className={cx.right}>
        <Toolbar
          view={view}
          onChange={setView}
          actionRight={<ExportButton onExport={setDialog} />}
        />
        <MapStyleProvider>
          {styleUrl => (
            <FilterView
              view={view}
              filter={filter}
              observations={observations}
              presets={presets}
              onUpdateObservation={updateObservation}
              onDeleteObservation={deleteObservation}
              getMediaUrl={api.getMediaUrl}
              getIconUrl={api.getIconUrl}
              mapStyle={styleUrl}
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
              onMapMove={setPosition}
              initialMapPosition={
                position.current == null ? undefined : position.current
              }
            />
          )}
        </MapStyleProvider>
      </div>
      <MapExportDialog
        open={dialog === 'map'}
        onClose={() => setDialog(null)}
        observations={observations}
        filter={filter}
        presets={presets}
        getMediaUrl={api.getMediaUrl}
      />
      <DataExportDialog
        open={dialog === 'data'}
        onClose={() => setDialog(null)}
        observations={observations}
        filter={filter}
        presets={presets}
        getMediaUrl={api.getMediaUrl}
      />
    </div>
  )
}

export default MapFilter

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    '@media only print': {
      width: 'auto',
      height: 'auto',
      position: 'static',
      backgroundColor: 'inherit',
      display: 'block'
    }
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    '@media only print': {
      width: 'auto',
      height: 'auto',
      position: 'static',
      backgroundColor: 'inherit',
      display: 'block'
    }
  },
  errorFallback: {
    backgroundColor: '#C00',
    color: '#FFF',
    padding: 10
  },
  viewWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex'
  }
}))

function addFieldDefinitions (preset, fields) {
  const fieldDefs = Array.isArray(preset.fields)
    ? preset.fields.map(fieldId => fields.find(field => field.id === fieldId))
    : []
  return {
    ...preset,
    fields: fieldDefs.filter(Boolean)
  }
}

function mapToArray (map) {
  return Object.keys(map).map(id => ({
    ...map[id],
    id: id
  }))
}

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { MapView, ReportView, MediaView } from 'react-mapfilter'
import debounce from 'lodash/debounce'
import logger from 'electron-timber'

import Toolbar from './Toolbar'
import FilterPanel from './FilterPanel'
import Loading from './Loading'
import api from '../../new-api'

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

const FilterView = ({ view, ...props }) => {
  const cx = useStyles()

  return (
    <div className={cx.viewWrapper}>
      {view === 'report' ? (
        <ReportView {...props} />
      ) : view === 'media' ? (
        <MediaView {...props} />
      ) : (
        <MapView {...props} />
      )}
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
        const presets = await api.getPresets()
        const fields = await api.getFields()
        const presetsWithFields = presets
          .filter(p => p.geometry.includes('point'))
          // Replace field ids with full field definitions
          .map(p => addFieldDefinitions(p, fields))
        setLoading(false)
        setPresets(presetsWithFields)
        setFields(fields)
      } catch (e) {
        logger.error(e)
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

  useEffect(() => {
    api
      .getObservations()
      .then(obs => {
        setObservations(obs)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return useMemo(
    () => [{ loading, error, observations }, { updateObservation }],
    [loading, error, observations, updateObservation]
  )
}

const MapFilter = () => {
  const cx = useStyles()
  const [view, setView] = useState('map')
  const [filter, setFilter] = useState(null)
  const [position, setPosition] = usePositionRef()

  const [
    { observationsLoading, observationsError, observations },
    { updateObservation }
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

  if (observationsError) console.error(observationsError)
  if (presetsError) console.error(presetsError)

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
          observations={observations}
          filter={filter}
          presets={presets}
          getMediaUrl={api.getMediaUrl}
        />
        <FilterView
          view={view}
          filter={filter}
          observations={observations}
          presets={presets}
          onUpdateObservation={updateObservation}
          getMediaUrl={api.getMediaUrl}
          getIconUrl={api.getIconUrl}
          mapboxAccessToken='pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'
          onMapMove={setPosition}
          initialMapPosition={
            position.current == null ? undefined : position.current
          }
        />
      </div>
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

  viewWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex'
  }
}))

function addFieldDefinitions (preset, fields) {
  const fieldDefs = Array.isArray(preset.fields)
    ? preset.fields.map(fieldId => fields.get(fieldId))
    : []
  return {
    ...preset,
    fields: fieldDefs.filter(Boolean)
  }
}

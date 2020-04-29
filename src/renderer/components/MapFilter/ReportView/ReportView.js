// @flow
import React, { useEffect, useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import ViewWrapper, { type CommonViewProps } from '../ViewWrapper'
import Toolbar from '../internal/Toolbar'
import PrintButton from './PrintButton'
import { FormattedTime, IntlProvider } from 'react-intl'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet
} from '@react-pdf/dom'
const { isEmptyValue } = require('../utils/helpers')
const { get } = require('../utils/get_set')
const FormattedFieldname = require('../internal/FormattedFieldname')
const FormattedValue = require('../internal/FormattedValue')
const FormattedLocation = require('../internal/FormattedLocation')

import type { Observation } from 'mapeo-schema'
import type { PresetWithAdditionalFields, FieldState, Field } from '../types'

const PdfContext = React.createContext(false)

type Props = {
  ...$Exact<CommonViewProps>
}

const hiddenTags = {
  categoryId: true,
  notes: true,
  note: true
}

const ReportView = ({
  observations,
  onUpdateObservation,
  onDeleteObservation,
  mapboxAccessToken,
  mapStyle,
  presets,
  filter,
  getMediaUrl,
  ...otherProps
}: Props) => {
  const stats = useMemo(() => getStats(observations || []), [observations])

  const [fieldState, setFieldState] = useState(() => {
    // Lazy initial state to avoid this being calculated on every render
    return Object.keys(stats)
      .filter(key => {
        // Hacky: don't include categoryId and notes in options of fields you can hide
        const fieldKey = JSON.parse(key)
        const fieldKeyString = Array.isArray(fieldKey) ? fieldKey[0] : fieldKey
        if (hiddenTags[fieldKeyString]) return false
        return true
      })
      .map(key => {
        const fieldKey = JSON.parse(key)
        const label = fieldKeyToLabel(fieldKey)
        return {
          id: key,
          hidden: false,
          label: Array.isArray(label) ? label.join('.') : label
        }
      })
  })

  const cx = useStyles()

  return (
    <ViewWrapper
      observations={observations}
      onUpdateObservation={onUpdateObservation}
      onDeleteObservation={onDeleteObservation}
      presets={presets}
      filter={filter}
      getMediaUrl={getMediaUrl}>
      {({ onClickObservation, filteredObservations, getPreset, getMedia }) => {
        const getPresetWithFilteredFields = (
          observation: Observation
        ): PresetWithAdditionalFields => {
          const preset = getPreset(observation)
          return {
            ...preset,
            fields: preset.fields.filter(hiddenFieldsFilter(fieldState)),
            additionalFields: preset.additionalFields.filter(
              hiddenFieldsFilter(fieldState)
            )
          }
        }

        const observations = filteredObservations.map(obs => {
          obs.preset = getPresetWithFilteredFields(obs)
          obs.attachments = obs.attachments.map((att) => {
            att.media = getMedia(obs)
            return att
          })
          return obs
        })

        return <div className={cx.root}>
          <Toolbar>
            <HideFieldsButton
              fieldState={fieldState}
              onFieldStateUpdate={setFieldState}
            />
          </Toolbar>
          <ReportPageContent
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
            observations={observations}
          />
      </div>
      }}
    </ViewWrapper>
  )
}

const ReportPageContent = ({
  observations,
  fieldState,
  mapboxAccessToken,
  mapStyle
}) => {
  return <Document>
    <Page size="A4" style={styles.page} wrap>
      <Text render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />

      <View render={({ pageNumber }) => {
        const observation = observations[pageNumber]
        console.log('rendering', pageNumber, observation)
        return observation && <FeaturePage
          key={observation.id}
          observation={observation}
          />
        }
      } />
    </Page>
  </Document>
}

function hiddenFieldsFilter (fieldState: FieldState) {
  return function (field: Field): boolean {
    const state = fieldState.find(fs => {
      const id = JSON.stringify(
        Array.isArray(field.key) ? field.key : [field.key]
      )
      return fs.id === id
    })
    return state ? !state.hidden : true
  }
}

export default ReportView

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: '100vh',
    height: '100vh',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column'
  }
}))

const FeaturePage = ({
  observation
}) => {
  const coords =
    typeof observation.lon === 'number' && typeof observation.lat === 'number'
      ? {
          longitude: observation.lon,
          latitude: observation.lat
        }
      : undefined
  const createdAt =
    typeof observation.created_at === 'string'
      ? new Date(observation.created_at)
      : undefined

  const preset = observation.preset
  const fields = preset.fields.concat(preset.additionalFields)
  const tags = observation.tags || {}
  const note = tags.note || tags.notes

  return (
    <View>
      <View style={styles.header} fixed />
      <View style={styles.pageContent}>
        <View style={styles.columnLeft}>
          <Text style={styles.presetName}>{preset.name || 'Observation'}</Text>
          {createdAt && (
            <Text style={styles.createdAt}>
              <Text style={styles.createdAtLabel}>Registrado: </Text>
              <FormattedTime
                key="time"
                value={createdAt}
                year="numeric"
                month="long"
                day="2-digit"
              />
            </Text>
          )}
          {coords && (
            <Text style={styles.location}>
              <Text style={styles.locationLabel}>Ubicación: </Text>
              <FormattedLocation {...coords} />
            </Text>
          )}
          {note &&
            note.split('\n').map((para, idx) => (
              <Text key={idx} style={styles.description}>
                {para}
              </Text>
            ))}
          <Text style={styles.details}>Detalles</Text>
          {fields.map(field => {
            const value = get(tags, field.key)
            if (isEmptyValue(value)) return null
            return (
              <View key={field.id} style={styles.field} wrap={false}>
                <Text style={styles.fieldLabel}>
                  <FormattedFieldname field='test' />
                </Text>
                <Text style={styles.fieldValue}>
                  <FormattedValue field='test' value={value} />
                </Text>
              </View>
            )
          })}
        </View>
        <View style={styles.columnRight}>
          {observation.attachments && observation.attachments.slice(0, 4).map((att, i) => {
            return att.media && <Image
              src={att.media.src}
              key={i}
              style={styles.image}
              wrap={false}
            />
          }
          )}
        </View>
      </View>
      <View style={styles.footer} fixed />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingTop: 120,
    paddingBottom: 35,
    paddingHorizontal: 35,
    flexDirection: 'row'
  },
  pageContent: {
    flex: 1,
    flexDirection: 'row'
  },
  columnLeft: {
    flex: 2,
    paddingRight: 12,
    lineHeight: 1.2
  },
  columnRight: {
    // backgroundColor: 'aqua',
    flex: 1
  },
  presetName: {
    fontWeight: 700
  },
  createdAt: {
    fontSize: 12
  },
  createdAtLabel: {
    fontSize: 12,
    color: 'grey'
  },
  location: {
    fontSize: 12,
    marginBottom: 6
  },
  locationLabel: {
    fontSize: 12,
    color: 'grey'
  },
  map: {
    height: '60mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 12,
    backgroundColor: '#8E918B'
  },
  image: {
    height: '40mm',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
    backgroundColor: '#C8D8E3'
  },
  description: {
    marginBottom: 6,
    fontSize: 12
  },
  details: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
    marginTop: 12
  },
  field: {
    marginBottom: 6
  },
  fieldLabel: {
    fontSize: 9,
    marginBottom: 1,
    color: '#333333'
  },
  fieldValue: {
    fontSize: 12
  },
  header: {
  },
  footer: {
  }

})

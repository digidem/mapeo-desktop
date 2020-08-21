// @flow
import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { BlobProvider } from '@react-pdf/renderer'

import ViewWrapper, { type CommonViewProps } from '../ViewWrapper'
import Toolbar from '../internal/Toolbar'
import { useIntl } from 'react-intl'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import PdfViewer from './PdfViewer'

import type { Observation } from 'mapeo-schema'
import type { PresetWithAdditionalFields, FieldState, Field } from '../types'
import { SettingsContext } from '../internal/Context'
import PDFReport from './PDFReport'

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
  const cx = useStyles()
  const intl = useIntl()
  const settings = React.useContext(SettingsContext)

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

        // ReportPageContent defined below...
        return (
          <div className={cx.root}>
            <Toolbar>
              <HideFieldsButton
                fieldState={fieldState}
                onFieldStateUpdate={setFieldState}
              />
            </Toolbar>
            <div className={cx.reportPreview}>
              <BlobProvider
                document={
                  <PDFReport
                    observations={filteredObservations.slice(0, 50)}
                    getPreset={getPresetWithFilteredFields}
                    getMedia={getMedia}
                    intl={intl}
                    settings={settings}
                  />
                }>
                {({ url, loading }) =>
                  <PdfViewer url={url} pages={observations.length} loading={loading} />
                }
              </BlobProvider>
            </div>
          </div>
        )
      }}
    </ViewWrapper>
  )
}

function hiddenFieldsFilter(fieldState: FieldState) {
  return function(field: Field): boolean {
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
    width: '100%',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  reportPreview: {
    flex: 1,
    overflowY: 'scroll'
  }
}))

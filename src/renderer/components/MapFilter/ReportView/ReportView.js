// @flow
import React, { useEffect, useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'

import ReportViewPDF, {
  type ReportViewPDFProps
} from '../ReportViewPDF/ReportView'
import ViewWrapper, { type CommonViewProps } from '../ViewWrapper'
import Toolbar from '../internal/Toolbar'
import PrintButton from './PrintButton'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'

import type { Observation } from 'mapeo-schema'
import type { PresetWithAdditionalFields, FieldState, Field } from '../types'

type Props = {
  ...$Exact<CommonViewProps>,
  ...$Exact<ReportViewPDFProps>
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
  presets,
  filter,
  getMediaUrl,
  ...otherProps
}: Props) => {
  const stats = useMemo(() => getStats(observations || []), [observations])
  const cx = useStyles()
  const [paperSize, setPaperSize] = useState('a4')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

        // Get preset with fields filtered out
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

        var PDF = () => <ReportViewPDF
          observations={filteredObservations}
          getPreset={getPresetWithFilteredFields}
          getMedia={getMedia}
          paperSize={paperSize}
          {...otherProps}
        />

        return (
          <div className={cx.root}>
            <Toolbar>
              {isClient && (<PDFDownloadLink
                document={<PDF />}
                filename={Date.now() + '.pdf'}>
                {({ blob, url, loading, error }) => (
                  !loading && <PrintButton />
                )}
              </PDFDownloadLink>
              )}
              <HideFieldsButton
                fieldState={fieldState}
                onFieldStateUpdate={setFieldState}
              />
            </Toolbar>
            {isClient && (<PDFViewer width="100%" height="100%">
              <PDF />
            </PDFViewer>)}
          </div>
        )
      }}
    </ViewWrapper>
  )
}

export default ReportView

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

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: '100vh',
    height: '100vh',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  }
}))

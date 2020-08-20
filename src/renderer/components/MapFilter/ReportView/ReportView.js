// @flow
import React, { useState, useLayoutEffect, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import ReportViewContent, {
  type ReportViewContentProps
} from './ReportViewContent'
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
  ...$Exact<ReportViewContentProps>
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
  const [print, setPrint] = useState(false)

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

  useLayoutEffect(() => {
    if (!print) return
    let didCancel = false

    // Wait for map to render
    // TODO: SUPER hacky - we need to wait for the map to render
    const timeoutId = setTimeout(() => {
      if (didCancel) return
      window.print()
      setPrint(false)
    }, 3000)
    return () => {
      didCancel = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [print])

  return (
    <ViewWrapper
      observations={observations}
      onUpdateObservation={onUpdateObservation}
      onDeleteObservation={onDeleteObservation}
      presets={presets}
      filter={filter}
      getMediaUrl={getMediaUrl}
    >
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
        return (
          <div className={cx.root}>
            <Toolbar>
              <PrintButton
                requestPrint={() => setPrint(true)}
                changePaperSize={newSize => setPaperSize(newSize)}
                paperSize={paperSize}
              />
              <HideFieldsButton
                fieldState={fieldState}
                onFieldStateUpdate={setFieldState}
              />
            </Toolbar>
            <ReportViewContent
              onClick={onClickObservation}
              observations={filteredObservations}
              getPreset={getPresetWithFilteredFields}
              getMedia={getMedia}
              paperSize={paperSize}
              print={print}
              {...otherProps}
            />
          </div>
        )
      }}
    </ViewWrapper>
  )
}

export default ReportView

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

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    '@media only print': {
      width: 'auto',
      height: 'auto',
      position: 'static',
      backgroundColor: 'inherit',
      display: 'block'
    }
  }
}))

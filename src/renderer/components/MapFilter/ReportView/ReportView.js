// @flow
import React, { useEffect, useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import ViewWrapper, { type CommonViewProps } from '../ViewWrapper'
import Toolbar from '../internal/Toolbar'
import PrintButton from './PrintButton'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import api from '../../../new-api'

import type { FieldState, Field } from '../types'

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
        var link = 'http://www.africau.edu/images/default/sample.pdf'

        const observations = filteredObservations.map(obs => {
          obs.preset = getPreset(obs)
          obs.attachments = obs.attachments.map((att) => {
            att.media = getMedia(obs)
            return att
          })
          return obs
        })

        var promise = api.createReport(observations, fieldState)
        promise.then((link) => {
          console.log(link)
        })

        return (
          <div className={cx.root}>
            <Toolbar>
              <a href="{link}" download>
                <PrintButton />
              </a>
              <HideFieldsButton
                fieldState={fieldState}
                onFieldStateUpdate={setFieldState}
              />
            </Toolbar>
          </div>
        )
      }}
    </ViewWrapper>
  )
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
    flexDirection: 'column',
  }
}))

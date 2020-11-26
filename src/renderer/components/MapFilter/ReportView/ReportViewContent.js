// @flow
import React, { useState, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'

import Toolbar from '../internal/Toolbar'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import PDFViewer from './PDFViewer'
// import PrintButton from './PrintButton'
import usePDFPreview from './usePDFPreview'
import type { Observation } from 'mapeo-schema'
import type {
  PresetWithAdditionalFields,
  FieldState,
  Field,
  CommonViewContentProps
} from '../types'
import { type MapViewContentProps } from '../MapView/MapViewContent'
import { SettingsContext } from '../internal/Context'

export type ReportViewContentProps = {
  ...$Exact<CommonViewContentProps>,
  mapStyle: $PropertyType<MapViewContentProps, 'mapStyle'>,
  mapboxAccessToken: $PropertyType<MapViewContentProps, 'mapboxAccessToken'>,
  initialPageNumber?: number
}

const m = defineMessages({
  // Button for navigating to the next page in the report
  nextPage: 'Next',
  // Button for nagivating to the previous page in the report
  prevPage: 'Previous',
  // Text showing the current page number when previewing a report
  currentPage: 'Page {currentPage}'
})

const hiddenTags = {
  categoryId: true,
  notes: true,
  note: true
}

const ReportViewContent = ({
  onClick,
  observations,
  getPreset,
  initialPageNumber = 1,
  ...otherProps
}: ReportViewContentProps) => {
  const stats = useMemo(() => getStats(observations || []), [observations])
  const intl = useIntl()
  const settings = React.useContext(SettingsContext)
  const cx = useStyles()
  const [currentPage, setCurrentPage] = React.useState(initialPageNumber)

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

  // WARNING: If this changes between renders, then the PDF will need to
  // re-index which will take some time.
  const getPresetWithFilteredFields = useCallback(
    (observation: Observation): PresetWithAdditionalFields => {
      const preset = getPreset(observation)
      return {
        ...preset,
        fields: preset.fields.filter(hiddenFieldsFilter(fieldState)),
        additionalFields: preset.additionalFields.filter(
          hiddenFieldsFilter(fieldState)
        )
      }
    },
    [fieldState, getPreset]
  )

  // observations and getPreset should be stable between renders in order for
  // caching to work
  const {
    blob,
    state: pdfState,
    pageNumber: pdfPageNumber,
    isLastPage
  } = usePDFPreview({
    currentPage,
    observations,
    intl,
    settings,
    getPreset: getPresetWithFilteredFields,
    ...otherProps
  })

  return (
    <div className={cx.root}>
      <Toolbar>
        <HideFieldsButton
          fieldState={fieldState}
          onFieldStateUpdate={setFieldState}
        />
      </Toolbar>
      <NavigationBar
        currentPage={currentPage}
        last={isLastPage}
        setCurrentPage={setCurrentPage}
      />
      <PDFViewer pdf={blob} pdfState={pdfState} pageNumber={pdfPageNumber} />
    </div>
  )
}

const NavigationBar = ({ currentPage, last, setCurrentPage }) => {
  const cx = useStyles()
  const handleNextPage = () => {
    var page = last ? currentPage : currentPage + 1
    setCurrentPage(page)
  }
  const handlePrevPage = () => {
    var page = Math.max(currentPage - 1, 1)
    setCurrentPage(page)
  }

  return (
    <div className={cx.navigation}>
      <Button disabled={currentPage === 1} onClick={handlePrevPage}>
        <FormattedMessage {...m.prevPage} />
      </Button>
      <FormattedMessage {...m.currentPage} values={{ currentPage }} />
      <Button disabled={last} onClick={handleNextPage}>
        <FormattedMessage {...m.nextPage} />
      </Button>
    </div>
  )
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

export default ReportViewContent

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    overflowY: 'scroll',
    paddingBottom: 20
  },
  navigation: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
}))

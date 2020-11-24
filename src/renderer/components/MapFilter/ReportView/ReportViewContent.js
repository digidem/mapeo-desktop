// @flow
import React, { useState, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { BlobProvider } from '@react-pdf/renderer'
import Button from '@material-ui/core/Button'

import Loading from '../../Loading'
import CenteredText from '../../CenteredText'
import Toolbar from '../internal/Toolbar'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import PdfViewer from './PdfViewer'
// import PrintButton from './PrintButton'
import PDFReport from './PDFReport'
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
  ...$Exact<MapViewContentProps>
}

const m = defineMessages({
  // Displayed whilst observations and presets load
  noReport: 'No observations available.',
  nextPage: 'Next',
  prevPage: 'Previous',
  previewMessage: 'Previewing first {numPages} pages' // TODO: pluralize
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
  ...otherProps
}: ReportViewContentProps) => {
  const stats = useMemo(() => getStats(observations || []), [observations])
  const intl = useIntl()
  const settings = React.useContext(SettingsContext)
  const cx = useStyles()
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageIndex, setPageIndex] = React.useState([])

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

  const [pdf, currentId] = useMemo(() => {
    function handleIndex (subIndex) {
      if (currentPage <= pageIndex.length) return
      setPageIndex([...pageIndex, ...subIndex])
    }

    let observation
    if (currentPage === 1) {
      observation = observations[0]
    } else if (currentPage <= pageIndex.length) {
      observation = observations.find(
        obs => obs.id === pageIndex[currentPage - 1]
      )
    } else {
      const prevId = pageIndex[pageIndex.length - 1]
      const prevIndex = observations.findIndex(obs => obs.id === prevId)
      observation = observations[prevIndex + 1]
    }

    // TODO Handle undefined observation here, otherwise will crash
    return observation
      ? [
          // eslint-disable-next-line react/jsx-key
          <PDFReport
            {...otherProps}
            observations={[observation]}
            getPreset={getPresetWithFilteredFields}
            onPageIndex={handleIndex}
            intl={intl}
            settings={settings}
          />,
          observation.id
        ]
      : [null, null]
  }, [
    otherProps,
    observations,
    getPresetWithFilteredFields,
    intl,
    settings,
    currentPage,
    pageIndex
  ])

  let pdfPageNumber = 1
  while (pageIndex[currentPage - pdfPageNumber - 1] === currentId) {
    pdfPageNumber++
  }

  return (
    <div className={cx.root}>
      <BlobProvider document={pdf}>
        {({ blob, url, loading, error }) => {
          if (!observations.length) {
            return <CenteredText text={intl.formatMessage(m.noReport)} />
          }
          return (
            <>
              <Toolbar>
                <HideFieldsButton
                  fieldState={fieldState}
                  onFieldStateUpdate={setFieldState}
                />
              </Toolbar>
              <NavigationBar
                currentPage={currentPage}
                totalPages={999}
                setCurrentPage={setCurrentPage}
              />
              {loading ? (
                <Loading />
              ) : (
                <div className={cx.reportPreview}>
                  <PdfViewer url={url} pageNumber={pdfPageNumber} />
                </div>
              )}
            </>
          )
        }}
      </BlobProvider>
    </div>
  )
}

const NavigationBar = ({ currentPage, totalPages, setCurrentPage }) => {
  const cx = useStyles()
  const handleNextPage = () => {
    var page = Math.min(currentPage + 1, totalPages)
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
      <FormattedMessage
        {...m.previewMessage}
        values={{ currentPage, totalPages }}
      />
      <Button disabled={currentPage === totalPages} onClick={handleNextPage}>
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
    flexDirection: 'column'
  },
  reportPreview: {
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center'
  },
  navigation: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
}))

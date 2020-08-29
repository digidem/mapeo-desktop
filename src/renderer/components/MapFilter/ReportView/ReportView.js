// @flow
import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { BlobProvider } from '@react-pdf/renderer'
import Button from '@material-ui/core/Button'

import Loading from '../../Loading'
import CenteredText from '../../CenteredText'
import ViewWrapper, { type CommonViewProps } from '../ViewWrapper'
import Toolbar from '../internal/Toolbar'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'
import HideFieldsButton from './HideFieldsButton'
import { fieldKeyToLabel } from '../utils/strings'
import getStats from '../stats'
import PdfViewer from './PdfViewer'
import PrintButton from './PrintButton'
import PDFReport from './PDFReport'

import type { Observation } from 'mapeo-schema'
import type { PresetWithAdditionalFields, FieldState, Field } from '../types'
import { SettingsContext } from '../internal/Context'

type Props = {
  ...$Exact<CommonViewProps>
}

const hiddenTags = {
  categoryId: true,
  notes: true,
  note: true
}

const m = defineMessages({
  // Displayed whilst observations and presets load
  noReport: 'No observations available.',
  nextPage: 'Next',
  prevPage: 'Previous',
  previewMessage: 'Previewing first {numPages} pages' // TODO: pluralize
})

const ReportView = ({
  observations,
  onUpdateObservation,
  onDeleteObservation,
  mapboxAccessToken,
  bounds,
  mapStyle,
  presets,
  filter,
  getMediaUrl,
  ...otherProps
}: Props) => {
  const stats = useMemo(() => getStats(observations || []), [observations])
  const intl = useIntl()
  const settings = React.useContext(SettingsContext)
  const cx = useStyles()

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


        var preview = filteredObservations.slice(0, 5)
        const pdf = <PDFReport
          observations={preview}
          getPreset={getPresetWithFilteredFields}
          getMedia={getMedia}
          intl={intl}
          settings={settings}
        />

        return (
          <div className={cx.root}>
            <BlobProvider document={pdf}>
              {({ url, loading, error }) => {
                if (loading) return <Loading />
                if (!filteredObservations.length) {
                  return <CenteredText text={intl.formatMessage(m.noReport)} />
                }

                return <ReportPreview
                  filteredObservations={filteredObservations}
                  fieldState={fieldState}
                  setFieldState={setFieldState}
                  url={url}
                  disablePrint={error || loading}
              />
              }}
            </BlobProvider>
          </div>
        )
      }}
    </ViewWrapper>
  )
}

const ReportPreview = React.memo(({
  disablePrint,
  url,
  fieldState,
  setFieldState,
}) => {
  const cx = useStyles()
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(1)

  const validPageNumber = Math.max(1, Math.min(pageNumber, numPages))

  const onLoadSuccess = ({numPages}) => {
    setNumPages(numPages)
  }


  return <>
      <Toolbar>
        <HideFieldsButton
          fieldState={fieldState}
          onFieldStateUpdate={setFieldState}
        />
        <PrintButton url={url} disabled={disablePrint} />
      </Toolbar>
      <div className={cx.reportPreview}>
        <NavigationBar
          pageNumber={validPageNumber}
          numPages={numPages}
          setPageNumber={setPageNumber}
        />
        <PdfViewer
          url={url}
          onLoadSuccess={onLoadSuccess}
          pageNumber={validPageNumber}
       />
      </div>
    </>
})
/** Turning this on fixes the flickering, but it causes
 * the PDF not to update to the latest filters
  , (prevProps, nextProps) => {
  return prevProps.numPages === nextProps.numPages
    && prevProps.pageNumber === nextProps.pageNumber
    && deepEqual(prevProps.filteredObservations, nextProps.filteredObservations)
})
*/

const NavigationBar = ({ pageNumber, numPages, setPageNumber }) => {
  const cx = useStyles()
  const handleNextPage = () => {
    var page = Math.min(pageNumber + 1, numPages)
    setPageNumber(page)
  }
  const handlePrevPage = () => {
    var page = Math.max(pageNumber - 1, 1)
    setPageNumber(page)
  }

  return (
    <div className={cx.navigation}>
      <Button disabled={pageNumber === 1} onClick={handlePrevPage}>
        <FormattedMessage {...m.prevPage} />
      </Button>
      <FormattedMessage {...m.previewMessage} values={{pageNumber, numPages}} />
      <Button disabled={pageNumber === numPages} onClick={handleNextPage}>
        <FormattedMessage {...m.nextPage} />
      </Button>
    </div>
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
    flexDirection: 'column',
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

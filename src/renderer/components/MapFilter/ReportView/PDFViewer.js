// @flow
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import Paper from '@material-ui/core/Paper'
import { defineMessages, useIntl } from 'react-intl'
import clsx from 'clsx'

import Loading from '../../Loading'
import CenteredText from '../../CenteredText'
import type { PDFState } from './usePDFPreview'

const m = defineMessages({
  // Displayed if no observations match current filter, or no observations in Mapeo
  noObservations: 'No observations available.',
  // Displayed if an error occurs when rendering the report
  reportError: 'An unknown error occurred trying to create the report'
})

type Props = {
  pdf?: Blob,
  pdfState: PDFState,
  pageNumber?: number
}

const PdfViewer = React.memo<Props>(({ pdf, pdfState, pageNumber }: Props) => {
  const intl = useIntl()
  const cx = useStyles()
  const [viewerState, setViewerState] = React.useState<
    'error' | 'loading' | 'ready'
  >('loading')

  React.useEffect(() => {
    setViewerState('loading')
  }, [pdf])

  const isLoading = pdfState === 'loading' || viewerState === 'loading' || !pdf

  return (
    <Paper className={cx.reportPreview} elevation={5}>
      {pdfState === 'empty' ? (
        <CenteredText text={intl.formatMessage(m.noObservations)} />
      ) : pdfState === 'error' || viewerState === 'error' ? (
        <CenteredText text={intl.formatMessage(m.reportError)} />
      ) : (
        <>
          {pdf && pageNumber ? (
            <Document
              file={pdf}
              onLoadSuccess={() => setViewerState('ready')}
              onLoadError={() => setViewerState('error')}
              loading={
                // Don't render a component during loading, because we render
                // our own as an overlay
                () => null
              }
            >
              <Page pageNumber={pageNumber} />
            </Document>
          ) : null}
          {/** TODO: Remove this after animation is complete, so that the user can select text in the PDF report */}
          <div className={clsx(cx.objectFill, !isLoading && cx.fade)}>
            <Loading />
          </div>
        </>
      )}
    </Paper>
  )
})

export default PdfViewer

const useStyles = makeStyles(theme => ({
  reportPreview: {
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    // TODO: Allow user-configurable page-size (Letter)
    width: (210 / 25.4) * 72,
    minHeight: (297 / 25.4) * 72
  },
  objectFill: {
    display: 'flex',
    width: '100%',
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
    position: 'absolute'
  },
  fade: {
    opacity: 0,
    transition: 'opacity 200ms ease-out'
  }
}))

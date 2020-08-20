import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import Button from '@material-ui/core/Button'

import Loading from '../../Loading'
import CenteredText from '../../CenteredText'

const m = defineMessages({
  // Displayed whilst observations and presets load
  noReport: 'No observations available.',
  nextPage: 'Next',
  prevPage: 'Previous',
  loadingPdf: 'Loading'
})

const PdfViewer = ({ url, pages, loading }) => {
  const cx = useStyles()
  const { formatMessage: t } = useIntl()

  let body

  if (loading) {
    body = <Loading />
  } else if (pages === 0) {
    body = <CenteredText text={t(m.noReport)} />
  } else {
    body = <PDFWithControls url={url} pages={pages} />
  }

  return (
    <div className={cx.root}>
      {body}
    </div>
  )
}

const PDFWithControls = ({url, pages}) => {
  const cx = useStyles()
  const [pageNumber, setPageNumber] = useState(1)
  const handleNextPage = () => setPageNumber(Math.min(pageNumber + 1, pages))
  const handlePrevPage = () => setPageNumber(Math.max(pageNumber - 1, 1))

  return (
    <div>
      <div className={cx.toolbarButton}>
        <Button disabled={pageNumber === 1} onClick={handlePrevPage}>
          <FormattedMessage {...m.prevPage} />
        </Button>
        <p>{pageNumber} / {pages}</p>
        <Button disabled={pageNumber === pages} onClick={handleNextPage}>
          <FormattedMessage {...m.nextPage} />
        </Button>
      </div>
      <Document file={url} onLoadError={console.log} onLoadSuccess={() => setPageNumber(1)}>
        <Page pageNumber={pageNumber} />
      </Document>
    </div>
  )
}

export default PdfViewer

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    backgroundColor: '#F5F5F5'
  },
  toolbarButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
}))

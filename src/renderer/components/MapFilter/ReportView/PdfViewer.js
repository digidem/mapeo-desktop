import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { defineMessages, useIntl } from 'react-intl'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

import CenteredText from '../../CenteredText'

const m = defineMessages({
  // Displayed whilst observations and presets load
  noReport: 'No observations available.'
})

const PdfViewer = ({ url, pages }) => {
  const [pageNumber, setPageNumber] = useState(null)
  const handleNextPage = () => setPageNumber(Math.min(pageNumber + 1, pages))
  const handlePrevPage = () => setPageNumber(Math.max(pageNumber - 1, 0))

  const cx = useStyles()
  const { formatMessage: t } = useIntl()

  if (pages === 0) {
    return (
      <div className={cx.root}>
        <CenteredText text={t(m.noReport)} />
      </div>
    )
  }

  return (
    <div>
      {pageNumber === null ? null : (
        <div>
          <p>{pageNumber + 1} / {pages}</p>
          <button onClick={handlePrevPage}>Previous Page</button>
          <button onClick={handleNextPage}>Next Page</button>
        </div>
      )}
      <Document file={url} onLoadError={console.log} onLoadSuccess={() => setPageNumber(0)}>
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
  }
}))

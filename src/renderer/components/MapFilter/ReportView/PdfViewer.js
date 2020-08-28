import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const PdfViewer = ({ url, onLoadSuccess, pageNumber }) => {
  const cx = useStyles()

  return (
    <div className={cx.pdfWithControls}>
      <Document
        file={url}
        onLoadError={console.log} // TODO: Show user error
        onLoadSuccess={onLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
    </div>
  )
}

export default PdfViewer

const useStyles = makeStyles(theme => ({
  pdfWithControls: {
    display: 'flex',
    flexDirection: 'row',
    margin: 'auto',
    justifyContent: 'center',
    flexGrow: '1'
  }
}))

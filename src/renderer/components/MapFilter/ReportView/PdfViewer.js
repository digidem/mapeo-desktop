import React from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const PdfViewer = ({ url }) => {
  return (
    <Document file={url} onLoadError={console.log} onLoadSuccess={console.log}>
      <Page pageNumber={1} />
    </Document>
  )
}

export default PdfViewer

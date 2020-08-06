import React, { useState } from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const PdfViewer = ({ url, pages }) => {
  const [pageNumber, setPageNumber] = useState(null)
  const handleNextPage = () => setPageNumber(Math.min(pageNumber + 1, pages))
  const handlePrevPage = () => setPageNumber(Math.max(pageNumber - 1, 1))

  return (
    <div>
      {pageNumber === null ? null : (
        <div>
          <p>{pageNumber} / {pages}</p>
          <button onClick={handlePrevPage}>Previous Page</button>
          <button onClick={handleNextPage}>Next Page</button>
        </div>
      )}
      <Document file={url} onLoadError={console.log} onLoadSuccess={() => setPageNumber(1)}>
        <Page pageNumber={pageNumber} />
      </Document>
    </div>
  )
}

export default PdfViewer

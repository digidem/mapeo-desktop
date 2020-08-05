import React, { useState }  from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const PdfViewer = ({ url, pages }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const handleNextPage = () => setPageNumber(Math.min(pageNumber + 1, pages))
  const handlePrevPage = () => setPageNumber(Math.max(pageNumber - 1, 1))

  return (
    <div>
      <p>{pageNumber} / {pages}</p>
      <button onClick={handleNextPage}>Next Page</button>
      <button onClick={handlePrevPage}>Previous Page</button>
      <Document file={url} onLoadError={console.log} onLoadSuccess={console.log}>
        <Page pageNumber={pageNumber} />
      </Document>
    </div>
  )
}

export default PdfViewer

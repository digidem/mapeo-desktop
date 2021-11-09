import React from 'react'

import { ExportDetailsForm } from './ExportDetailsForm'
import { ExportSuccessful } from './ExportSuccessful'
import { NoData } from './NoData'

export const Content = ({
  allObservations,
  filteredObservations,
  getMediaUrl,
  onClose
}) => {
  const [showExportSuccess, setShowExportSuccess] = React.useState(false)

  const noData = allObservations.length === 0

  return noData ? (
    <NoData onClose={onClose} />
  ) : showExportSuccess ? (
    <ExportSuccessful onClose={onClose} />
  ) : (
    <ExportDetailsForm
      allObservations={allObservations}
      filteredObservations={filteredObservations}
      getMediaUrl={getMediaUrl}
      onClose={onClose}
      onSuccess={() => setShowExportSuccess(true)}
    />
  )
}

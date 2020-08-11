// @flow
import React from 'react'

import ReportPaper from './ReportPaper'
import ReportPageContent from './ReportPageContent'
import { getFields } from '../lib/data_analysis'
import exampleObservations from '../../../../../fixtures/observations.json'

export default {
  title: 'ReportView/components/ReportPageContent'
}

export const withData = () => {
  const tags = exampleObservations[0].tags
  const fields = getFields(tags)
  return (
    <ReportPaper paperSize="a4">
      <ReportPageContent
        name="Observation"
        iconLabel="C"
        iconColor="red"
        coords={{ longitude: -51, latitude: 23 }}
        createdAt={new Date()}
        imageSrc="https://s3.amazonaws.com/images.digital-democracy.org/mapfilter-sample/sample-17.jpg"
        fields={fields}
        tags={tags}
        paperSize="a4"
      />
    </ReportPaper>
  )
}

withData.story = {
  name: 'with data'
}

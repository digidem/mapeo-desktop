// @flow

import { pdf } from '@digidem/react-pdf-renderer'
import concat from 'simple-concat'
import PQueue from 'p-queue'
import React from 'react'

import { PDFReport, type ReportProps } from './PDFReport'

const queue = new PQueue({ concurrency: 1 })

function renderToStream (doc) {
  return queue.add(() => {
    const instance = pdf({ initialValue: doc })
    return instance.toBuffer()
  })
}

async function renderPDF (
  props: ReportProps
): Promise<{ buffer: Buffer, index: Array<string> }> {
  let pageIndex: Array<string> = []
  const doc = (
    <PDFReport {...props} onPageIndex={index => (pageIndex = index)} />
  )
  const outStream = await renderToStream(doc)
  return new Promise((resolve, reject) => {
    concat(outStream, (err, buffer) => {
      if (err) return reject(err)
      resolve({ buffer, index: pageIndex })
    })
  })
}

self.addEventListener('message', async msg => {
  switch (msg.data.action) {
    case 'RENDER_PDF': {
      console.log('Render!')
      const { buffer, index } = await renderPDF(msg.data.props)
      console.log('Ok, ready')
      self.postMessage({ id: msg.data.id, buffer: buffer.buffer, index }, [
        buffer.buffer
      ])
    }
  }
})

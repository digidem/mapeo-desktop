// @flow

import Worker from './renderReport.worker.js'
import { type ReportProps } from './PDFReport'
import type { ReportViewContentProps } from './ReportViewContent'

type ReportData = {
  blob: Blob,
  index: Array<string>
}

type Props = {
  ...$Exact<
    $Diff<ReportViewContentProps, { onClick: *, totalObservations: * }>
  >,
  intl: any,
  settings: any,
  startPage?: number
}

const reportWorker = new Worker()
let msgId = 1
const pending = new Map<number, (ReportData) => void>()

reportWorker.addEventListener('message', msg => {
  const { id, buffer, index } = msg.data
  if (!id || !pending.has(id)) return
  const resolve = pending.get(id)
  console.log('resolvable!', id, !!resolve, index)
  pending.delete(id)
  resolve &&
    resolve({ blob: new Blob([buffer], { type: 'application/pdf' }), index })
})

export default function renderReport (
  { observations, getPreset, getMedia, intl, ...otherProps }: Props,
  timeout?: number
): Promise<ReportData> {
  const id = msgId++
  return new Promise((resolve, reject) => {
    const props: ReportProps = {
      observationsWithPresets: observations.map(obs => ({
        observation: obs,
        preset: getPreset(obs),
        mediaSources: (obs.attachments || []).reduce((acc, cur) => {
          acc[cur.id] = getMedia(cur)
          return acc
        }, {})
      })),
      locale: intl.locale,
      messages: intl.messages,
      ...otherProps
    }
    reportWorker.postMessage({ props, action: 'RENDER_PDF', id })
    pending.set(id, resolve)
    if (!timeout) return
    setTimeout(() => {
      if (!pending.has(id)) return
      pending.delete(id)
      console.log('Reject!', id)
      reject(new Error('Report generation timeout'))
    }, timeout)
  })
}

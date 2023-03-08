import api from '../../../new-api'

const reportWorker = new Worker('./reportWorker.bundle.js', { type: 'module' })

let msgId = 1
const pending = new Map()

// $FlowFixMe
reportWorker.addEventListener('message', msg => {
  console.log('MESSAGE', msg)
  const { id, buffer, index } = msg.data
  if (!id || !pending.has(id)) return
  const resolve = pending.get(id)
  pending.delete(id)
  resolve &&
    resolve({ blob: new Blob([buffer], { type: 'application/pdf' }), index })
})

reportWorker.addEventListener('error', err => {
  console.log('ERROR RETURNED FROM WORKER', err)
})

reportWorker.addEventListener('messageerror', err => {
  console.log('MESSAGEERROR RETURNED FROM WORKER', err)
})

export default function renderReport (
  { observations, getPreset, getMedia, intl, ...otherProps },
  timeout
) {
  const id = msgId++
  return new Promise((resolve, reject) => {
    const props = {
      observationsWithPresets: observations.map(obs => {
        const preset = getPreset(obs)
        return {
          observation: obs,
          preset,
          iconURL: preset && preset.icon && api.getIconUrl(preset.icon),
          mediaSources: (obs.attachments || []).reduce((acc, cur) => {
            acc[cur.id] = getMedia(cur)
            return acc
          }, {})
        }
      }),
      mapImageTemplateURL: api.getMapImageTemplateURL(),
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
      reject(new Error('Report generation timeout'))
    }, timeout)
  })
}

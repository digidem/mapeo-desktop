// @flow
import React from 'react'
import QuickLRU from 'quick-lru'
import type { Observation } from 'mapeo-schema'

import { renderPdfReport } from './PDFReport'
import type { ReportViewContentProps } from './ReportViewContent'

export type PdfState = 'error' | 'loading' | 'empty' | 'ready'

type Props = {
  ...$Diff<ReportViewContentProps, { onClick: * }>,
  intl: any,
  settings: any,
  currentPage: number
}
function usePdfReport ({
  observations = [],
  intl,
  settings,
  currentPage,
  getMedia,
  getPreset,
  mapStyle,
  mapboxAccessToken
}: Props): { blob?: Blob, pageNumber?: number, state: PdfState } {
  // pageIndex is a cached index of observation IDs by page number. If the
  // observations change, or getPreset changes (which changes which fields are
  // displayed) then page numbers will change, so the index is no longer correct
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pageIndex: string[] = React.useMemo(() => [], [observations, getPreset])

  // pdfCache is a cache of rendered PDF pages for each observation. If the
  // observations change, or getPreset changes (which changes which fields are
  // displayed) then the output PDF will change, so we throw away this cache.
  // WARNING: If we add new report config that changes how observations are
  // displayed, then it should be added to the deps here so that the cache is
  // invalidated
  const pdfCache = React.useMemo(
    () =>
      new QuickLRU<Observation, Promise<{ blob: Blob, index: string[] }>>({
        maxSize: 100
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [observations, getPreset]
  )

  const [blob, setBlob] = React.useState()
  const [state, setState] = React.useState<PdfState>(
    observations.length ? 'loading' : 'empty'
  )

  // uwc-debug
  React.useEffect(() => {
    if (!observations.length) {
      setState('empty')
      return
    }
    let cancel = false

    function cachedRender (obs: Observation) {
      const cached = pdfCache.get(obs)
      console.log('CACHED?', !!cached)
      if (cached) return cached
      const pdfPromise = renderPdfReport({
        observations: [obs],
        intl,
        settings,
        getMedia,
        getPreset,
        mapStyle,
        mapboxAccessToken
      })
      pdfCache.set(obs, pdfPromise)
      return pdfPromise
    }

    // This logic and the caching is necessary if we are to support first render
    // being at any page. E.g. if we render page 10, then we need to know how
    // many pages each observation takes up, up to page 10, before we know what
    // to render on page 10
    ;(async function () {
      // Set pageIndex to be at least as long as currentPage
      pageIndex.length = Math.max(pageIndex.length, currentPage)
      setState('loading')

      // We need to fill the page index up to the current page, so that we know
      // what observation should be showing on the current page. Ensure that
      // this always runs once (to set pdf)
      while (pageIndex.includes(undefined)) {
        // Index of first empty value in pageIndex array - will always be > -1
        // because while loop only runs when pageIndex contains undefined values
        const emptyIdx = pageIndex.findIndex(v => typeof v === 'undefined')
        let obs
        if (emptyIdx === 0) {
          obs = observations[0]
        } else {
          const lastIndexedObsId = pageIndex[emptyIdx - 1]
          // Find the index of the last observation in the page index
          const idx = observations.findIndex(obs => obs.id === lastIndexedObsId)
          // If the observation in the page index is not in the observations
          // array, then something has gone wrong (the index is stale?)
          if (idx === -1 && pageIndex.length) return setState('error')

          // Get observation at index idx + 1
          obs = observations[idx + 1]
        }

        // If obs is undefined, currentPage is beyond the last page in the
        // report, so this is an error
        if (!obs) return setState('error')

        const { index } = await cachedRender(obs)
        // Copy page index from PDF of single observation into overall page index
        for (let i = 0; i < index.length; i++) {
          pageIndex[emptyIdx + i] = index[i]
        }
      }
      const obsId = pageIndex[currentPage - 1]
      const obsIdx = observations.findIndex(obs => obs.id === obsId)
      const obs = observations[obsIdx]
      if (!obs) return setState('error')
      const { blob } = await cachedRender(obs)
      // Eagerly queue up render of next observation
      const nextObs = observations[obsIdx + 1]
      if (nextObs) {
        cachedRender(nextObs)
      }
      if (cancel) return
      setBlob(blob)
      setState('ready')
    })()

    return () => {
      cancel = true
    }
  }, [
    currentPage,
    getMedia,
    getPreset,
    intl,
    mapStyle,
    mapboxAccessToken,
    observations,
    pageIndex,
    pdfCache,
    settings
  ])

  let pageNumber
  if (state === 'ready') {
    pageNumber = 1
    while (
      pageIndex[currentPage - pageNumber - 1] === pageIndex[currentPage - 1]
    ) {
      pageNumber++
    }
  }

  // Are there more pages to come in the report (we don't know how many until we
  // have rendered the whole report)
  let more = false
  if (state === 'ready') {
    if (pageIndex.length > currentPage) more = true
    const lastIndexedObsIdx = observations.findIndex(
      obs => obs.id === pageIndex[pageIndex.length - 1]
    )
    if (observations[lastIndexedObsIdx + 1]) more = true
  }
  return { blob, pageNumber, state, more }
}

export default usePdfReport

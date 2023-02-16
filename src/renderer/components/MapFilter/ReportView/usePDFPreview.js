//
import React from 'react'
import QuickLRU from 'quick-lru'

import renderPDFReport from './renderReport'

import logger from '../../../../logger'

// Seeing a race condition which causes the report to never finish rendering, so
// set a timeout so it does not get stuck in "loading"
const TIMEOUT = 5000

// This hook generates a PDF for a single observation. It uses the array of all
// observations to display in the report and the current page to calculate which
// observation should be shown. This is because (A) we do not know what
// observation will appear on a given page until we have rendered the report for
// all previous observations, because they can take more than one page, and (B)
// because generating the entire report each time the filter changes would take
// several seconds. Instead this hook renders the report _up to_ the current
// page, and caches the pages for each observation. This allows the user to
// navigate through pages in the report and render them dynamically as the user
// navigates, without needing to render the entire report.
export default function usePDFPreview ({
  observations = [],
  intl,
  settings,
  currentPage,
  getMedia,
  getPreset,
  mapStyle,
  mapboxAccessToken
}) {
  // The cache should re-render if any of these change -- check these if you are
  // not seeing the PDF preview change as expected when you change settings
  const cacheDeps = [observations, getPreset, intl]

  // pageIndex is a cached index of observation IDs by page number. If the
  // observations change, or getPreset changes (which changes which fields are
  // displayed) then page numbers will change, so the index is no longer correct
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pageIndex = React.useMemo(() => [], cacheDeps)

  // pdfCache is a cache of rendered PDF pages for each observation. If the
  // observations change, or getPreset changes (which changes which fields are
  // displayed) then the output PDF will change, so we throw away this cache.
  // WARNING: If we add new report config that changes how observations are
  // displayed, then it should be added to the deps here so that the cache is
  // invalidated
  const pdfCache = React.useMemo(
    () =>
      new QuickLRU({
        maxSize: 100
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    cacheDeps
  )

  const [blob, setBlob] = React.useState()
  const [state, setState] = React.useState(
    observations.length ? 'loading' : 'empty'
  )

  React.useEffect(() => {
    if (!observations.length) {
      setState('empty')
      return
    }
    let cancel = false

    function cachedRender (obs, startPage) {
      const cached = pdfCache.get(obs)
      if (cached) return cached
      const pdfPromise = renderPDFReport(
        {
          observations: [obs],
          intl,
          settings,
          getMedia,
          getPreset,
          mapStyle,
          mapboxAccessToken,
          startPage
        },
        TIMEOUT
      )
      pdfCache.set(obs, pdfPromise)
      // Don't cache if render fails
      pdfPromise.catch(e => {
        pdfCache.delete(obs)
      })
      return pdfPromise
    }

    // This logic and the caching is necessary if we are to support first render
    // being at any page. E.g. if we render page 10, then we need to know how
    // many pages each observation takes up, up to page 10, before we know what
    // to render on page 10
    ;(async function () {
      // Set pageIndex to be at least as long as currentPage, but trim any
      // undefined entries off the end (this can happen if the user was on an
      // invalid page (beyond length of the report) after changing a filter
      const emptyIdx = pageIndex.findIndex(v => typeof v === 'undefined')
      pageIndex.length = Math.max(
        emptyIdx > -1 ? emptyIdx : pageIndex.length,
        currentPage
      )
      setState('loading')
      let loops = 0

      // We need to fill the page index up to the current page, so that we know
      // what observation should be showing on the current page. Ensure that
      // this always runs once (to set pdf)
      // eslint-disable-next-line no-unmodified-loop-condition
      while (pageIndex.findIndex(v => typeof v !== 'string') > -1 && !cancel) {
        // Avoid infinite loop in case of bug
        if (loops++ > pageIndex.length) {
          logger.error(new Error('Inifite loop in PDF preview'))
          return setState('error')
        }
        // Index of first empty value in pageIndex array - will always be > -1
        // because while loop only runs when pageIndex contains undefined values
        const emptyIdx = pageIndex.findIndex(v => typeof v !== 'string')
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

        try {
          const { index } = await cachedRender(obs, emptyIdx + 1)
          if (cancel) return
          // Copy page index from PDF of single observation into overall page index
          for (let i = 0; i < index.length; i++) {
            pageIndex[emptyIdx + i] = index[i]
          }
        } catch (e) {
          if (cancel) return
          // This should not happen, something is up with PDF rendering
          logger.error(e)
          return setState('error')
        }
      }
      const obsId = pageIndex[currentPage - 1]
      const startPage = pageIndex.indexOf(obsId) + 1
      const obsIdx = observations.findIndex(obs => obs.id === obsId)
      const obs = observations[obsIdx]
      if (!obs) return setState('error')
      try {
        const { blob, index } = await cachedRender(obs, startPage)
        if (cancel) return
        // Eagerly queue up render of next observation, don't await result
        const nextObs = observations[obsIdx + 1]
        if (nextObs) {
          cachedRender(nextObs, startPage + index.length)
        }
        if (cancel) return
        setBlob(blob)
        setState('ready')
      } catch (e) {
        if (cancel) return
        // This should not happen, something is up with PDF rendering
        logger.error(e)
        return setState('error')
      }
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
      // Avoid an infinite loop: ensure that the index is not empty and we're
      // not going to be reading 'undefined'
      pageIndex.length > currentPage - pageNumber &&
      !pageIndex.includes(undefined) &&
      pageIndex[currentPage - pageNumber - 1] === pageIndex[currentPage - 1]
    ) {
      pageNumber++
    }
  }

  // Are there more pages to come in the report (we don't know how many until we
  // have rendered the whole report)
  let isLastPage = false
  if (state === 'ready') {
    isLastPage = true
    if (pageIndex.length > currentPage) isLastPage = false
    const lastIndexedObsIdx = observations.findIndex(
      obs => obs.id === pageIndex[pageIndex.length - 1]
    )
    if (observations[lastIndexedObsIdx + 1]) isLastPage = false
  }
  return {
    blob,
    pageNumber,
    state,
    isLastPage,
    observationId: pageIndex[currentPage - 1]
  }
}

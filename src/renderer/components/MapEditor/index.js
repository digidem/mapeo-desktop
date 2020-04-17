import React from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer, remote, shell } from 'electron'
import iD from 'id-mapeo'
import debounce from 'lodash/debounce'
import insertCss from 'insert-css'

import api from '../../new-api'
import { defineMessages, useIntl } from 'react-intl'
import ExportButton from './ExportButton'

const m = defineMessages({
  'feedback-contribute-button': 'Feedback & Contribute'
})

// iD Editor style overrides
insertCss(`
  .id-container .header {
    height: 64px;
  }
  .id-container .pane {
    bottom: 0;
  }
  .id-container .entity-editor-pane .inspector-body, .id-container .selection-list-pane .inspector-body {
    top: 64px;
  }
  .id-container #bar {
    height: 64px;
    background-color: white;
    padding: 0 8px 0 8px;
    align-items: center;
  }
  .id-container #bar .toolbar-item .item-label {
    display: none;
  }
  .id-container #bar .toolbar-item .item-content {
    flex: 1;
    display: inline-flex;
    border-radius: 4px;
  }
  .id-container #bar .toolbar-item.sidebar-toggle {
    display: none;
  }
  .id-container #bar > .toolbar-item.spacer:nth-child(2) {
    display: none;
  }
  .id-container button.bar-button {
    border: 1px solid rgba(0, 0, 0, 0.12);
    background-color: rgba(0,0,0,0);
    height: 44px;
    font-family: Rubik, sans-serif;
    font-weight: 500;
    line-height: 1.75;
    font-size: 0.875rem;
    padding: 0 16px;
  }
  .id-container [dir='ltr'] .add-point .tooltip {
    left: 0 !important;
  }
  .id-container [dir='ltr'] .add-point .tooltip .tooltip-arrow {
    left: 20px;
  }
  .id-container button.bar-button.active {
    background-color: #7092ff;
  }
  .id-container button.bar-button:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .id-container button.bar-button:not(:first-child) {
    border-left: 1px solid transparent;
    margin-left: -1px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .id-container .joined > *:last-child {
    border-right-width: 1px;
  }
  .id-container button.save .count {
    min-width: auto;
    padding-left: 8px
  }
  .id-container #bar .mapeo-toolbar-item.mapeo-spacer {
    width: 100%;
    flex-grow: 2;
  }
  .id-container #bar .mapeo-toolbar-item {
    display: flex;
    flex: 0 1 auto;
    flex-flow: column wrap;
    justify-content: center;
    position: relative;
  }
`)

const { localStorage, location } = window

const MapEditor = () => {
  const rootRef = React.useRef()
  const id = React.useRef()
  const customDefs = React.useRef()
  const { formatMessage: t, locale } = useIntl()
  const [toolbarEl, setToolbarEl] = React.useState()

  const zoomToData = React.useCallback((_, loc) => {
    if (!id.current) return
    id.current.map().centerZoomEase(loc, 14, 1000)
  }, [])

  React.useEffect(
    function setupListeners () {
      ipcRenderer.on('zoom-to-data-node', zoomToData)
      ipcRenderer.on('zoom-to-latlon-response', zoomToData)
      return () => {
        ipcRenderer.removeListener('zoom-to-data-node', zoomToData)
        ipcRenderer.removeListener('zoom-to-latlon-response', zoomToData)
      }
    },
    [zoomToData]
  )

  React.useEffect(() => {
    function refreshWindow () {
      if (!id.current) return
      var history = id.current.history()
      var saved = history.toJSON()
      id.current.flush()
      if (saved) history.fromJSON(saved)
      ipcRenderer.send('zoom-to-data-get-centroid', 'node', zoomToData)
    }
    const subscription = api.addDataChangedListener('observation-edit', () =>
      refreshWindow()
    )
    return () => {
      subscription.remove()
    }
  }, [zoomToData])

  React.useEffect(function saveLocation () {
    var prevhash = localStorage.getItem('location')
    if (prevhash) location.hash = prevhash

    const onHashChange = debounce(() => {
      localStorage.setItem('location', window.location.hash)
    }, 200)

    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  React.useLayoutEffect(
    function initIdEditor () {
      if (!rootRef.current) return
      updateSettings()

      var serverUrl = 'http://' + remote.getGlobal('osmServerHost')
      id.current = window.id = iD
        .coreContext()
        .assetPath('node_modules/id-mapeo/dist/')
        .preauth({ url: serverUrl })
        .minEditableZoom(window.localStorage.getItem('minEditableZoom') || 14)

      // Calling iD.coreContext() detects the locale from the browser. We need
      // to override it with the app locale, before we call ui()
      id.current.locale(locale)

      if (!customDefs.current) {
        customDefs.current = id.current
          .container()
          .append('svg')
          .style('position', 'absolute')
          .style('width', '0px')
          .style('height', '0px')
          .attr('id', 'custom-defs')
          .append('defs')

        customDefs.current.append('svg')
      }

      id.current.ui()(rootRef.current, function onLoad () {
        var links = document.querySelectorAll('.id-container a[href^="http"]')
        links.forEach(function (link) {
          var href = link.getAttribute('href')
          link.onclick = function (event) {
            event.preventDefault()
            shell.openExternal(href)
            return false
          }
        })

        var contributeBtn = document.querySelector(
          '.id-container .overlay-layer-attribution a'
        )
        if (contributeBtn) {
          contributeBtn.innerHTML = t(m['feedback-contribute-button'])
        }

        // Add custom buttons to toolbar
        const toolbar = id.current.container().select('#bar')
        toolbar.append('div').attr('class', 'mapeo-toolbar-item mapeo-spacer')
        setToolbarEl(toolbar.append('div').node())

        // Update label on map move
        var aboutList = id.current.container().select('#about-list')
        var map = id.current.map()
        var latlon = aboutList
          .append('li')
          .append('span')
          .text(latlonToPosString(map.center()))
        id.current.container().on('mousemove', function () {
          var pos = map.mouseCoordinates()
          var s = latlonToPosString(pos)
          latlon.text(s)
        })

        updateSettings()

        // iD uses onbeforeunload to prompt the user about unsaved changes.
        // Electron does not prompt the user on this event, and iD saves changes
        // to local storage anyway, so we can just ignore it
        window.onbeforeunload = e => {
          if (!id.current || typeof id.current.context !== 'function') return
          id.current.context().save()
          // This guarantees that the unload continues
          delete e.returnValue
        }
        // setTimeout(() => id.current.flush(), 1500)
      })
    },
    // This should have a dependency of `t` and `locale`, so that it re-runs if
    // the locale or the `t` function changes, but we don't have an easy way to
    // teardown iD editor and then recreate it, so we need to never re=-run this
    // effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  function updateSettings () {
    var presets = ipcRenderer.sendSync('get-user-data', 'presets')
    var customCss = ipcRenderer.sendSync('get-user-data', 'css')
    var imagery = ipcRenderer.sendSync('get-user-data', 'imagery')
    var icons = ipcRenderer.sendSync('get-user-data', 'icons')
    var translations = ipcRenderer.sendSync('get-user-data', 'translations')

    if (translations && id.current) {
      const currentLocale = id.current.locale()
      // Todo fallback should be default language of presets. Currently it's
      // random - it just uses the first locale returned from Object.keys()
      const translationsInLocale =
        translations[currentLocale] ||
        translations[Object.keys(translations)[0]] ||
        {}
      if (translationsInLocale.presets) {
        ;(iD.translations[currentLocale] || iD.translations.en).presets =
          translationsInLocale.presets
      }
    }
    if (presets) {
      const iDPresets = convertPresets(presets)
      if (!id.current) {
        iDPresets.fields = { ...iD.data.presets.fields, ...iDPresets.fields }
        iD.data.presets = iDPresets
      }
    }
    if (customCss) insertCss(customCss)
    if (imagery) {
      // iD upgraded to use 'dataImagery' in 2.14.3, this is for backwards
      // compatibility
      if (imagery.dataImagery) imagery = imagery.dataImagery
      imagery.forEach((img, idx) => {
        // Add id
        img.id = img.name + '_' + idx
        iD.data.imagery.unshift(img)
      })
    }
    if (icons) {
      var parser = new window.DOMParser()
      var iconsSvg = parser.parseFromString(icons, 'image/svg+xml')
        .documentElement
      var defs = customDefs.current && customDefs.current.node()
      if (defs) defs.replaceChild(iconsSvg, defs.firstChild)
    }
  }

  return (
    <div className='id-container'>
      <div ref={rootRef} />
      {toolbarEl && ReactDOM.createPortal(<ExportButton />, toolbarEl)}
    </div>
  )
}

export default MapEditor

function latlonToPosString (pos) {
  pos[0] = (Math.floor(pos[0] * 1000000) / 1000000).toString()
  pos[1] = (Math.floor(pos[1] * 1000000) / 1000000).toString()
  while (pos[0].length < 10) pos[0] += '0'
  while (pos[1].length < 10) pos[1] += '0'
  return pos.toString()
}

// iD Editor requires that [fallback presets are
// defined](https://github.com/openstreetmap/iD/tree/develop/data/presets#custom-presets),
// so that entities on the map always match _something_.
const fallbackPresets = {
  area: {
    name: 'Area',
    tags: {},
    geometry: ['area'],
    matchScore: 0.1
  },
  line: {
    name: 'Line',
    tags: {},
    geometry: ['line'],
    matchScore: 0.1
  },
  point: {
    name: 'Point',
    tags: {},
    geometry: ['point', 'vertex'],
    matchScore: 0.1
  },
  relation: {
    name: 'Relation',
    tags: {},
    geometry: ['relation'],
    matchScore: 0.1
  }
}

// iD Editor requires that a "name" field is always defined.
const fallbackFields = {
  name: {
    key: 'name',
    type: 'localized',
    label: 'Name',
    placeholder: 'Common name (if any)'
  }
}

/**
 * Presets for Mapeo use a slightly different schema than presets for iD Editor.
 * Currently the main difference is select_one fields
 */
function convertPresets (presetsObj) {
  const fields = { ...fallbackFields, ...presetsObj.fields }
  const presets = { ...fallbackPresets, ...presetsObj.presets }

  // In Mapeo Mobile (and Observation View) we do not yet use the preset.tags
  // property to match presets to entities on the map. Instead we match based on
  // categoryId === presetId. For using presets from Mapeo Mobile in iD, if a
  // preset does not have any properties set on `preset.tags` then we use
  // `categoryId`
  Object.keys(presets).forEach(presetId => {
    const preset = presets[presetId]
    if (
      Object.keys(preset.tags || {}).length === 0 &&
      // Skip for fallback presets `point`, `line`, `area`, `relation`
      !Object.keys(fallbackPresets).includes(presetId)
    ) {
      presets[presetId] = {
        ...preset,
        tags: {
          categoryId: presetId
        }
      }
    }
  })

  Object.keys(fields).forEach(fieldId => {
    const field = fields[fieldId]
    let type
    let snakeCase
    switch (field.type) {
      case 'select_one':
        type = 'combo'
        snakeCase =
          typeof field.snake_case === 'boolean' ? field.snake_case : false
        break
      case 'select_multiple':
        type = 'semiCombo'
        break
      case 'text':
        if (!field.appearance || field.appearance === 'multiline') {
          type = 'textarea'
        }
        break
      default:
        type = field.type
    }

    fields[fieldId] = {
      ...field,
      type,
      snake_case: snakeCase
    }
    if (Array.isArray(field.options)) {
      fields[fieldId].options = field.options.map(opt => {
        if (opt && opt.value) return opt.value
        return opt
      })
    }
  })

  return {
    ...presetsObj,
    fields,
    presets
  }
}

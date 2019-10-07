import React from 'react'
import { ipcRenderer, remote, shell } from 'electron'
import iD from 'id-mapeo'
import debounce from 'lodash/debounce'
import insertCss from 'insert-css'

import pkg from '../../../package.json'
import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
  'feedback-contribute-button': 'Feedback & Contribute'
})

const { localStorage, location } = window

const MapEditor = () => {
  const ref = React.useRef()
  const id = React.useRef()
  const customDefs = React.useRef()
  const { formatMessage: t } = useIntl()

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
      if (!ref.current) return
      updateSettings()

      var serverUrl = 'http://' + remote.getGlobal('osmServerHost')
      id.current = window.id = iD
        .coreContext()
        .assetPath('node_modules/id-mapeo/dist/')
        .preauth({ url: serverUrl })
        .minEditableZoom(14)

      id.current.version = pkg.version

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

      id.current.ui()(ref.current, function onLoad () {
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
          if (!id.current) return
          id.current.context().save()
          // This guarantees that the unload continues
          delete e.returnValue
        }
        // setTimeout(() => id.current.flush(), 1500)
      })
    },
    [t]
  )

  function updateSettings () {
    var presets = ipcRenderer.sendSync('get-user-data', 'presets')
    var customCss = ipcRenderer.sendSync('get-user-data', 'css')
    var imagery = ipcRenderer.sendSync('get-user-data', 'imagery')
    var icons = ipcRenderer.sendSync('get-user-data', 'icons')

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
      <div ref={ref} />
    </div>
  )
}

export default MapEditor

// refreshWindow () {
//   if (this.id) {
//     var history = this.id.history()
//     var saved = history.toJSON()
//     this.id.flush()
//     if (saved) history.fromJSON(saved)
//     ipcRenderer.send('zoom-to-data-get-centroid', 'node')
//   }
// }

// zoomToLatLonResponse (_, lat, lon) {
//   var self = this
//   self.id.map().centerEase([lat, lon], 1000)
//   setTimeout(function () {
//     self.id.map().zoom(15)
//   }, 1000)
// }

// zoomToDataRequest () {
//   ipcRenderer.send('zoom-to-data-get-centroid', 'node')
// }

// zoomToDataResponse (_, loc) {
//   var self = this
//   var zoom = 14
//   self.id.map().centerEase(loc, 1000)
//   setTimeout(function () {
//     self.id.map().zoom(zoom)
//   }, 1000)
// }

// changeLanguageRequest () {
//   var self = this
//   var dialogs = Dialogs()
//   dialogs.prompt(i18n('menu-change-language-title'), function (locale) {
//     if (locale) {
//       self.setState({ locale })
//       ipcRenderer.send('set-locale', locale)
//       self.id.ui().restart(locale)
//     }
//   })
// }

function latlonToPosString (pos) {
  pos[0] = (Math.floor(pos[0] * 1000000) / 1000000).toString()
  pos[1] = (Math.floor(pos[1] * 1000000) / 1000000).toString()
  while (pos[0].length < 10) pos[0] += '0'
  while (pos[1].length < 10) pos[1] += '0'
  return pos.toString()
}

/**
 * Presets for Mapeo use a slightly different schema than presets for iD Editor.
 * Currently the main difference is select_one fields
 */
function convertPresets (presets) {
  const fields = { ...presets.fields }

  Object.keys(fields).forEach(fieldId => {
    const field = fields[fieldId]
    const type = field.type === 'select_one' ? 'combo' : field.type

    fields[fieldId] = {
      ...field,
      type
    }
    if (Array.isArray(field.options)) {
      fields[fieldId].options = field.options.map(opt => {
        if (opt && opt.value) return opt.value
        return opt
      })
    }
  })

  return {
    ...presets,
    fields
  }
}

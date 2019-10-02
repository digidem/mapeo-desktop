import React from 'react'
import { ipcRenderer, remote, shell } from 'electron'
import iD from 'id-mapeo'
import debounce from 'lodash/debounce'

import pkg from '../../../package.json'
import { defineMessages, useIntl } from 'react-intl'

const m = defineMessages({
  'feedback-contribute-button': 'Feedback & Contribute'
})

const MapEditor = () => {
  const ref = React.useRef()
  const id = React.useRef()
  const { formatMessage: t } = useIntl()

  const zoomToData = React.useCallback((_, loc) => {
    if (!id.current) return
    id.current.map().centerZoomEase(loc, 14, 1000)
  }, [])

  React.useEffect(
    function setupListeners () {
      ipcRenderer.on('zoom-to-data-response', zoomToData)
      ipcRenderer.on('zoom-to-latlon-response', zoomToData)
      return () => {
        ipcRenderer.removeListener('zoom-to-data-response', zoomToData)
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

      var serverUrl = 'http://' + remote.getGlobal('osmServerHost')
      id.current = window.id = iD
        .coreContext()
        .assetPath('node_modules/id-mapeo/dist/')
        .preauth({ url: serverUrl })
        .minEditableZoom(14)

      id.current.version = pkg.version

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
        // setTimeout(() => id.current.flush(), 1500)
      })
    },
    [t]
  )

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

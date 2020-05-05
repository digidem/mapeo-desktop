import { remote } from 'electron'
import 'core-js/es/reflect'
import ky from 'ky/umd'
import logger from '../logger'

const BASE_URL = 'http://' + remote.getGlobal('osmServerHost') + '/'

export default Api({
  // window.middlewareClient is set in src/middleware/client-preload.js
  ipc: window.middlewareClient,
  baseUrl: BASE_URL
})

function Api ({ baseUrl, mapeo, ipc }) {
  // We append this to requests for presets and map styles, in order to override
  // the local static server cache whenever the app is restarted. NB. sprite,
  // font, and map tile requests might still be cached, only changes in the map
  // style will be cache-busted.
  const startupTime = Date.now()

  const req = ky.extend({
    prefixUrl: baseUrl,
    // No timeout because indexing after first sync takes a long time, which mean
    // requests to the server take a long time
    timeout: false,
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache'
    }
  })

  function logRequest (prefix, promise) {
    const start = Date.now()
    promise
      .then(data => {
        logger.log(prefix, Date.now() - start + 'ms')
      })
      .catch(error => {
        logger.error(prefix, error)
      })
    return promise
  }
  // Request convenience methods that wait for the server to be ready
  function get (url) {
    return logRequest('<GET: ' + url, req.get(url).json())
  }
  function del (url) {
    return logRequest('<DEL: ' + url, req.delete(url).json())
  }
  function put (url, data) {
    logger.log('>PUT:', url, data)
    return logRequest('<PUT: ' + url, req.put(url, { json: data }).json())
  }
  function post (url, data) {
    logger.log('>POST:', url, data)
    return logRequest('<POST: ' + url, req.post(url, { json: data }).json())
  }

  // All public methods
  const api = {
    /**
     * GET async methods
     */

    getPresets: function getPresets () {
      return get(`presets/default/presets.json?${startupTime}`).then(data =>
        mapToArray(data.presets)
      )
    },

    getFields: function getFields () {
      return get(`presets/default/presets.json?${startupTime}`).then(data =>
        mapToArray(data.fields)
      )
    },

    getObservations: function getObservations () {
      return get('observations')
    },

    getMapStyle: function getMapStyle (id) {
      return get(`styles/${id}/style.json?${startupTime}`)
    },

    /**
     * DELETE methods
     */

    deleteObservation: function deleteObservation (id) {
      return del(`observations/${id}`)
    },

    /**
     * PUT and POST methods
     */

    updateObservation: function updateObservation (id, value) {
      const valueForServer = {
        ...value,
        type: 'observation',
        schemaVersion: 3,
        id
      }
      return put(`observations/${id}`, valueForServer)
    },

    createObservation: function createObservation (value) {
      const valueForServer = {
        ...value,
        type: 'observation',
        schemaVersion: 3
      }
      return post('observations', valueForServer)
    },

    /**
     * SYNC methods
     */

    // Listens to the server for updates to the list of peers available for sync
    // returns a remove() function to unscubribe
    addPeerListener: function addPeerListener (handler) {
      // We sidestep the http API here, and instead of polling the endpoint, we
      // listen for an event from mapeo-core whenever the peers change, then
      // request an updated peer list.
      function onPeerUpdate (peers) {
        logger.log('peer-update', peers)
        handler(peers)
      }
      ipc.on('peer-update', onPeerUpdate)
      api.syncGetPeers().then(handler)
      return {
        remove: () => ipc.removeListener('peer-update', onPeerUpdate)
      }
    },

    addDataChangedListener: function (ev, handler) {
      ipc.on('sync-complete', handler)
      ipc.on(ev, handler)
      return {
        remove: () => {
          ipc.removeListener('sync-complete', handler)
          ipc.removeListener(ev, handler)
        }
      }
    },

    getEncryptionKey: function () {
      return new Promise((resolve, reject) => {
        ipc.send('encryption-key', null, (err, encryptionKey) => {
          if (err) return reject(err)
          resolve(encryptionKey)
        })
      })
    },

    // Start listening for sync peers and advertise with `deviceName`
    syncJoin: function syncJoin () {
      logger.log('Join sync')
      ipc.send('sync-join')
    },

    // Stop listening for sync peers and stop advertising
    syncLeave: function syncLeave () {
      logger.log('Leave sync')
      ipc.send('sync-leave')
    },

    // Get a list of discovered sync peers
    syncGetPeers: function syncGetPeers () {
      return get('sync/peers').then(data => data && data.message)
    },

    // Start sync with a peer
    syncStart: function syncStart (target) {
      ipc.send('sync-start', target)
    },

    exportData: function (filename, { format = 'geojson' } = {}) {
      return new Promise((resolve, reject) => {
        ipc.send('export-data', { filename, format }, (err) => {
          if (err) {
            logger.error('Export error', err.stack)
            reject(err)
          } else resolve()
        })
      })
    },

    /**
     * HELPER synchronous methods
     */

    // Return the url for an icon
    getIconUrl: function getIconUrl (iconId, size = 'medium') {
      // Some devices are @4x or above, but we only generate icons up to @3x
      // Also we don't have @1.5x, so we round it up
      const roundedRatio = Math.min(Math.ceil(window.devicePixelRatio), 3)
      return `${baseUrl}presets/default/icons/${iconId}-medium@${roundedRatio}x.png`
    },

    // Return the url for a media attachment
    getMediaUrl: function getMediaUrl (attachmentId, size = 'preview') {
      return `${baseUrl}media/${size}/${attachmentId}`
    },

    // Return the url to a map style
    getMapStyleUrl: function getMapStyleUrl (id) {
      return `${baseUrl}styles/${id}/style.json?${startupTime}`
    }
  }

  return api
}

function mapToArray (map) {
  return Object.keys(map).map(id => ({
    ...map[id],
    id: id
  }))
}

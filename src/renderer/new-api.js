import { remote } from 'electron'
import 'core-js/es/reflect'
import ky from 'ky'
import debug from 'debug'

const log = debug('mapeo:api')
const BASE_URL = 'http://' + remote.getGlobal('osmServerHost') + '/'

export function Api ({ baseUrl }) {
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

  // Request convenience methods that wait for the server to be ready
  function get (url) {
    return req.get(url).json()
  }
  function del (url) {
    return req.delete(url).json()
  }
  function put (url, data) {
    return req.put(url, { json: data }).json()
  }
  function post (url, data) {
    return req.post(url, { json: data }).json()
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
      return get(`styles/${id}/style.json`)
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

    savePhoto: function savePhoto ({ originalUri, previewUri, thumbnailUri }) {
      if (!originalUri || !previewUri || !thumbnailUri) {
        return Promise.reject(
          new Error('Missing uri for full image or thumbnail to save to server')
        )
      }
      const data = {
        original: originalUri.replace(/^file:\/\//, ''),
        preview: previewUri.replace(/^file:\/\//, ''),
        thumbnail: thumbnailUri.replace(/^file:\/\//, '')
      }
      const createPromise = post('media', data)
      // After images have saved to the server we can delete the versions in
      // local cache to avoid filling up space on the phone
      const localFiles = Object.values(data)
      createPromise
        // $FlowFixMe - Flow has issues with Object.values
        .then(_ => Promise.all(localFiles.map(path => RNFS.unlink(path))))
        .then(() => log('Deleted temp photos on save', localFiles))
        .catch(err => log('Error deleting local image file', err))
      return createPromise
    },

    updateObservation: function updateObservation (id, value, options) {
      const valueForServer = {
        ...value,
        // work around for a quirk in the api right now, we should probably change
        // this to accept a links array. An array is needed if you want to merge
        // existing forks
        version: options.links[0],
        userId: options.userId,
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
      nodejs.channel.addListener('peer-update', handler)
      api.syncGetPeers().then(handler)
      return {
        remove: () => nodejs.channel.removeListener('peer-update', handler)
      }
    },

    // Start listening for sync peers and advertise with `deviceName`
    syncJoin: function syncJoin (deviceName) {
      req.get(`sync/join?name=${deviceName}`)
    },

    // Stop listening for sync peers and stop advertising
    syncLeave: function syncLeave () {
      req.get('sync/leave')
    },

    // Get a list of discovered sync peers
    syncGetPeers: function syncGetPeers () {
      return get('sync/peers').then(data => data && data.message)
    },

    // Start sync with a peer
    syncStart: function syncStart (target) {
      return onReady().then(() => nodejs.channel.post('sync-start', target))
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
    getMediaUrl: function getMediaUrl (attachmentId, size) {
      return `${baseUrl}media/${size}/${attachmentId}`
    },

    // Return the url to a map style
    getMapStyleUrl: function getMapStyleUrl (id) {
      return `${baseUrl}styles/${id}/style.json?${startupTime}`
    }
  }

  return api
}

export default Api({ baseUrl: BASE_URL })
